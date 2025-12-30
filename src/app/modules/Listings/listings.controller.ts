import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TourServices } from './listings.service';
import pick from '../../../shared/pick';
import { tourFilterableFields } from './listings.constant';
import { paginationFields } from '../../constrains';
import { JwtPayload } from '../../interfaces/jwt.interface';

const createTour = catchAsync(
    async (req: Request, res: Response) => {
        const result = await TourServices.createTour(req);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Tour created successfully',
            data: result,
        });
    }
);

const updateTour = catchAsync(
    async (req: Request, res: Response) => {
        const result = await TourServices.updateTour(req);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Tour updated successfully',
            data: result,
        });
    }
);

const getAllTours = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, tourFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await TourServices.getAllTours(
        filters,
        paginationOptions
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tours retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getTourById = catchAsync(async (req: Request, res: Response) => {
    const result = await TourServices.getTourById(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tour retrieved successfully',
        data: result,
    });
});

const getMyTours = catchAsync(
    async (req: Request, res: Response) => {
        const result = await TourServices.getMyTours(req);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "My tours retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    }
);

const deleteTour = catchAsync(async (req: Request, res: Response) => {
    const result = await TourServices.deleteTour(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tour deactivated successfully',
        data: result,
    });
});

export const TourController = {
    createTour,
    updateTour,
    getAllTours,
    getTourById,
    getMyTours,
    deleteTour,
};
