import { prisma } from "../../../lib/prisma";
import { generateOTP, OTP_EXPIRY_MINUTES, OTP_RESEND_LIMIT, OTP_RESEND_WINDOW_MS } from "../../../helpers/otp";
// import { sendOtpMail } from "../../../helpers/sendOtpMail.js";
import ApiError from "../../errors/apiError";
import httpStatus from "http-status";
import { sendOtpMail } from "../../../helpers/sendOtpMail";
import { Request } from "express";
import { JwtPayload } from "../../interfaces/jwt.interface";


const getAllGuides = async () => {
    const guide = await prisma.guide.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    status: true
                }
            }
        }
    });

    if (!guide) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide not found")
    }

    return guide;
}

const getGuideById = async (id: string) => {
    const guide = await prisma.guide.findUnique({
        where: {
            id
        },
    });

    if (!guide) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide not found")
    }

    return guide;
}

/* ---------------- SEND OTP ---------------- */
const sendVerificationOtp = async (userId: string) => {
    const guide = await prisma.guide.findFirstOrThrow({
        where: { userId },
        include: { user: true },
    });

    if (guide.isVerified) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide already verified");
    }

    const otp = generateOTP();
    const now = new Date();

    await prisma.guide.update({
        where: { id: guide.id },
        data: {
            otp,
            otpExpiresAt: new Date(
                now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
            ),
            otpAttempts: 1,
            otpLastSentAt: now,
        },
    });

    await sendOtpMail(guide.user.email, otp);
    return true;
};

/* ---------------- VERIFY OTP ---------------- */
const verifyGuideOtp = async (userId: string, otp: string) => {
    const guide = await prisma.guide.findFirstOrThrow({
        where: { userId },
    });

    if (!guide.otp || guide.otp !== otp) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
    }

    if (!guide.otpExpiresAt || guide.otpExpiresAt < new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired");
    }

    await prisma.guide.update({
        where: { id: guide.id },
        data: {
            isVerified: true,
            otp: null,
            otpExpiresAt: null,
            otpAttempts: 0,
            otpLastSentAt: null,
        },
    });

    return true;
};

/* ---------------- RESEND OTP (RATE-LIMITED) ---------------- */
const resendVerificationOtp = async (userId: string) => {
    const guide = await prisma.guide.findFirstOrThrow({
        where: { user: { id: userId } },
        include: { user: true },
    });

    if (guide.isVerified) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide already verified");
    }

    const now = new Date();

    // ⛔ Block if OTP still valid
    if (guide.otp && guide.otpExpiresAt && guide.otpExpiresAt > now) {
        const remaining = Math.ceil(
            (guide.otpExpiresAt.getTime() - now.getTime()) / 1000
        );

        throw new ApiError(
            httpStatus.TOO_MANY_REQUESTS,
            `OTP already sent. Try again after ${remaining}s`
        );
    }

    // 🔁 Reset attempts after window
    if (
        guide.otpLastSentAt &&
        now.getTime() - guide.otpLastSentAt.getTime() > OTP_RESEND_WINDOW_MS
    ) {
        await prisma.guide.update({
            where: { id: guide.id },
            data: { otpAttempts: 0 },
        });
    }

    if (guide.otpAttempts >= OTP_RESEND_LIMIT) {
        throw new ApiError(
            httpStatus.TOO_MANY_REQUESTS,
            "Too many OTP requests. Try again later."
        );
    }

    const otp = generateOTP();

    await prisma.guide.update({
        where: { id: guide.id },
        data: {
            otp,
            otpExpiresAt: new Date(
                now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
            ),
            otpAttempts: { increment: 1 },
            otpLastSentAt: now,
        },
    });

    await sendOtpMail(guide.user.email, otp);
    return true;
};

const getGuideEarnings = async (req: Request) => {
    const guide = await prisma.guide.findFirstOrThrow({
        where: { userId: req.user!.userId },
    });

    const result = await prisma.booking.aggregate({
        where: {
            guideId: guide.id,
            status: "COMPLETED",
            paymentStatus: "COMPLETED",
            isGuidePaid: false,
        },
        _sum: {
            guidePayoutAmount: true,
        },
        _count: {
            id: true,
        },
    });

    return {
        totalUnpaidEarning: result._sum.guidePayoutAmount || 0,
        totalCompletedBookings: result._count.id,
    };
}

export const getAllGuidesUnpaidEarnings = async () => {
    // Step 1: Fetch all verified guides
    const guides = await prisma.guide.findMany({
        where: { isVerified: true },
        select: {
            id: true,
            name: true,
            profilePhoto: true,
            dailyRate: true,
            userId: true,
        },
    });

    // Step 2: Aggregate unpaid earnings for each guide
    const earnings = await prisma.booking.groupBy({
        by: ["guideId"],
        where: {
            guideId: { in: guides.map(g => g.id) },
            status: "COMPLETED",
            paymentStatus: "COMPLETED",
            isGuidePaid: false,
        },
        _sum: { guidePayoutAmount: true },
        _count: { id: true },
    });

    // Step 3: Merge guide info with earnings, filter out guides with 0 earning
    const result = earnings
        .map(e => {
            const guide = guides.find(g => g.id === e.guideId);
            if (!guide) return null; // just in case

            return {
                guideId: guide.id,
                name: guide.name,
                profilePhoto: guide.profilePhoto,
                dailyRate: guide.dailyRate,
                totalUnpaidEarning: e._sum.guidePayoutAmount || 0,
                totalCompletedBookings: e._count.id,
            };
        })
        .filter(g => g && g.totalUnpaidEarning > 0); // remove guides with 0 unpaid earnings

    return result;
};

export const GuideServices = {
    getAllGuides,
    getGuideById,
    sendVerificationOtp,
    verifyGuideOtp,
    resendVerificationOtp,
    getGuideEarnings,
    getAllGuidesUnpaidEarnings
};
