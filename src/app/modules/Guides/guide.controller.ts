// src/app/modules/guide/guide.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { GuideServices } from './guide.service';

const sendOtp = catchAsync(async (req: Request, res: Response) => {
    const email = req.user?.email || ""
    await GuideServices.sendVerificationOtp(email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OTP sent to email',
        data: {},
    });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
    const { otp } = req.body;
    const email = req.user?.email || ""

    await GuideServices.verifyGuideOtp(email, otp);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guide verified successfully',
        data: {}
    });
});

// src/app/modules/guide/guide.controller.ts

const resendOtp = catchAsync(async (req: Request, res: Response) => {
    const email = req.user?.email || ""
    await GuideServices.resendVerificationOtp(email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OTP resent successfully',
        data: {}
    });
});


export const GuideController = {
    sendOtp,
    verifyOtp,
    resendOtp
};
