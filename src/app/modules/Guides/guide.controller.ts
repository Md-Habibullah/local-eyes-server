// src/app/modules/guide/guide.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { GuideServices } from './guide.service';

const getAllGuides = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.getAllGuides();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guides retrieve successfully',
        data: result,
    });
});
const getGuideById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.getGuideById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guide retrieve successfully',
        data: result,
    });
});

const sendOtp = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await GuideServices.sendVerificationOtp(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OTP sent to email',
        data: {},
    });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
    const { otp } = req.body;
    const userId = req.user!.userId;

    await GuideServices.verifyGuideOtp(userId, otp);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guide verified successfully',
        data: {}
    });
});

// src/app/modules/guide/guide.controller.ts

const resendOtp = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await GuideServices.resendVerificationOtp(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OTP resent successfully',
        data: {}
    });
});

const getGuideUnpaidEarnings = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.getGuideEarnings(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Unpaid earnings retrieved successfully',
        data: result
    });
});

const getAllGuidesUnpaidEarnings = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.getAllGuidesUnpaidEarnings();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All guides unpaid earnings retrieved successfully',
        data: result
    });
});

export const GuideController = {
    getAllGuides,
    getGuideById,
    sendOtp,
    verifyOtp,
    resendOtp,
    getGuideUnpaidEarnings,
    getAllGuidesUnpaidEarnings
};
