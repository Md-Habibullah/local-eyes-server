import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { bookingFilterableFields } from './booking.constant';
import { BookingServices, getBookingByIdService } from './booking.service';
import { paginationFields } from '../../constrains';
import { JwtPayload } from '../../interfaces/jwt.interface';

const createBooking = catchAsync(
    async (req: Request, res: Response) => {
        const result = await BookingServices.createBooking(req);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Booking requested successfully',
            data: result,
        });
    }
);

const getAllBookings = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query, bookingFilterableFields);
        const paginationOptions = pick(req.query, paginationFields);

        const result = await BookingServices.getAllBookings(
            req.user as JwtPayload,
            filters,
            paginationOptions
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Bookings retrieved successfully',
            meta: result.meta,
            data: result.data,
        });
    }
);


export const getBookingById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { bookingId } = req.params;

        const result = await getBookingByIdService(bookingId);

        res.status(httpStatus.OK).json({
            success: true,
            message: "Booking retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateBookingStatus = catchAsync(
    async (req: Request, res: Response) => {
        const result = await BookingServices.updateBookingStatus(req);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Booking status updated',
            data: result,
        });
    }
);

const cancelBookingByTourist = catchAsync(
    async (req: Request, res: Response) => {
        const result = await BookingServices.cancelBookingByTourist(req);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Booking cancelled',
            data: result,
        });
    }
);

export const BookingController = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    cancelBookingByTourist
};
