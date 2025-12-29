import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { reviewFilterableFields } from './review.constant';
import { ReviewServices } from './review.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';

const createReview = catchAsync(
    async (req: Request, res: Response) => {
        const result = await ReviewServices.createReview(req);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Review submitted successfully',
            data: result,
        });
    }
);

const getReviews = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, reviewFilterableFields);

    const result = await ReviewServices.getReviews(filters);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieved successfully',
        data: result,
    });
});

export const ReviewController = {
    createReview,
    getReviews,
};
