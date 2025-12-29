import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/apiError';
import { prisma } from '../../../lib/prisma';
import { BookingStatus, UserRole } from '../../../generated/prisma/enums';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interfaces/pagination';

// ===============================
// CREATE BOOKING (TOURIST)
// ===============================
const createBooking = async (req: Request & { user?: any }) => {
    const tourist = await prisma.tourist.findFirstOrThrow({
        where: {
            user: { email: req.user.email },
        },
    });

    const tour = await prisma.tour.findUniqueOrThrow({
        where: { id: req.body.tourId, isActive: true },
    });

    const totalAmount = tour.price * req.body.numberOfPeople;

    const booking = await prisma.booking.create({
        data: {
            touristId: tourist.id,
            guideId: tour.guideId,
            tourId: tour.id,
            date: new Date(req.body.date),
            numberOfPeople: req.body.numberOfPeople,
            totalAmount,
        },
    });

    return booking;
};

// ===============================
// GET ALL BOOKINGS (ROLE BASED)
// ===============================
const getAllBookings = async (
    user: any,
    filters: any,
    paginationOptions: IPaginationOptions
) => {
    const { page, limit, skip } =
        paginationHelper.calculatePagination(paginationOptions);

    let whereCondition: any = {};

    // role based access
    if (user.role === UserRole.TOURIST) {
        const tourist = await prisma.tourist.findFirstOrThrow({
            where: { user: { email: user.email } },
        });
        whereCondition.touristId = tourist.id;
    }

    if (user.role === UserRole.GUIDE) {
        const guide = await prisma.guide.findFirstOrThrow({
            where: { user: { email: user.email } },
        });
        whereCondition.guideId = guide.id;
    }

    Object.assign(whereCondition, filters);

    const data = await prisma.booking.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            tour: true,
            tourist: true,
            guide: true,
        },
    });

    const total = await prisma.booking.count({ where: whereCondition });

    return {
        meta: { page, limit, total },
        data,
    };
};

// ===============================
// UPDATE BOOKING STATUS (GUIDE)
// ===============================
const updateBookingStatus = async (req: Request & { user?: any }) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUniqueOrThrow({
        where: { id },
    });

    const guide = await prisma.guide.findFirstOrThrow({
        where: { user: { email: req.user.email } },
    });

    // ownership check
    if (booking.guideId !== guide.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not allowed');
    }

    // 🔐 BOOKING WORKFLOW VALIDATION (ADD HERE 👇)

    // completed booking cannot be changed
    if (booking.status === BookingStatus.COMPLETED) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Completed booking cannot be changed'
        );
    }

    // cannot complete without confirming
    if (
        booking.status === BookingStatus.PENDING &&
        req.body.status === BookingStatus.COMPLETED
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Confirm booking before completing'
        );
    }

    // ✅ safe to update now
    return prisma.booking.update({
        where: { id },
        data: { status: req.body.status },
    });
};


export const BookingServices = {
    createBooking,
    getAllBookings,
    updateBookingStatus,
};
