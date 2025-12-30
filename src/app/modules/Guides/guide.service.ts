import { prisma } from "../../../lib/prisma";
import { generateOTP, OTP_EXPIRY_MINUTES, OTP_RESEND_LIMIT, OTP_RESEND_WINDOW_MS } from "../../../helpers/otp";
// import { sendOtpMail } from "../../../helpers/sendOtpMail.js";
import ApiError from "../../errors/apiError";
import httpStatus from "http-status";
import { sendOtpMail } from "../../../helpers/sendOtpMail";

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

export const GuideServices = {
    sendVerificationOtp,
    verifyGuideOtp,
    resendVerificationOtp,
};
