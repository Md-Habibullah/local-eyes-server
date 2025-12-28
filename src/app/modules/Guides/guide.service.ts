// src/app/modules/guide/guide.service.ts
import { prisma } from '../../../lib/prisma';
import { generateOTP } from '../../../helpers/otp';
import { sendOtpMail } from '../../../helpers/sendOtpMail';
import ApiError from '../../errors/apiError';
import httpStatus from 'http-status';

const sendVerificationOtp = async (userEmail: string) => {
    const guide = await prisma.guide.findFirstOrThrow({
        where: { user: { email: userEmail } },
        include: { user: true },
    });

    if (guide.isVerified) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Guide already verified');
    }

    const otp = generateOTP();

    await prisma.guide.update({
        where: { id: guide.id },
        data: {
            otp,
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
        },
    });

    await sendOtpMail(guide.user.email, otp);

    return true;
};

const verifyGuideOtp = async (email: string, otp: string) => {
    const guide = await prisma.guide.findFirstOrThrow({
        where: { user: { email } },
    });

    if (!guide.otp || guide.otp !== otp) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
    }

    if (guide.otpExpiresAt! < new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
    }

    await prisma.guide.update({
        where: { id: guide.id },
        data: {
            isVerified: true,
            otp: null,
            otpExpiresAt: null,
        },
    });

    return true;
};

// src/app/modules/guide/guide.service.ts

const resendVerificationOtp = async (userEmail: string) => {
    const guide = await prisma.guide.findFirstOrThrow({
        where: { user: { email: userEmail } },
        include: { user: true },
    });

    if (guide.isVerified) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Guide already verified');
    }

    // ⛔ block resend if OTP still valid
    if (guide.otp && guide.otpExpiresAt && guide.otpExpiresAt > new Date()) {
        const remaining =
            Math.ceil((guide.otpExpiresAt.getTime() - Date.now()) / 1000);

        throw new ApiError(
            httpStatus.TOO_MANY_REQUESTS,
            `OTP already sent. Try again after ${remaining}s`
        );
    }

    const otp = generateOTP();

    await prisma.guide.update({
        where: { id: guide.id },
        data: {
            otp,
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
        },
    });

    await sendOtpMail(guide.user.email, otp);

    return true;
};


export const GuideServices = {
    sendVerificationOtp,
    verifyGuideOtp,
    resendVerificationOtp
};
