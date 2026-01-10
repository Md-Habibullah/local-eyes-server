import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/apiError';
import { prisma } from '../../../lib/prisma';
import { BookingStatus, UserRole } from '../../../generated/prisma/enums';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interfaces/pagination';
import { JwtPayload } from '../../interfaces/jwt.interface';

// ===============================
// CREATE BOOKING (TOURIST)
// ===============================
const createBooking = async (req: Request & { user?: any }) => {
    const { tourId, date, numberOfPeople } = req.body;

    const bookingDate = new Date(date);

    // 🔒 past date block
    if (bookingDate < new Date()) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "You cannot book a tour for a past date"
        );
    }

    const tourist = await prisma.tourist.findUnique({
        where: { userId: req.user!.userId },
    });

    if (!tourist) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tourist not found");
    }

    const tour = await prisma.tour.findUnique({
        where: { id: tourId, isActive: true },
    });

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found");
    }

    // 🚫 check duplicate booking by same tourist
    const existingBooking = await prisma.booking.findFirst({
        where: {
            touristId: tourist.id,
            tourId: tour.id,
            date: bookingDate,
            status: {
                not: "CANCELLED",
            },
        },
    });

    if (existingBooking) {
        throw new ApiError(
            httpStatus.CONFLICT,
            "You already booked this tour for the selected date"
        );
    }

    // 🚫 check guide availability (same date)
    const guideAlreadyBooked = await prisma.booking.findFirst({
        where: {
            guideId: tour.guideId,
            date: bookingDate,
            status: {
                in: ["PENDING", "CONFIRMED"],
            },
        },
    });

    if (guideAlreadyBooked) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Guide is not available on this date"
        );
    }

    const totalAmount = tour.price * numberOfPeople;

    const booking = await prisma.booking.create({
        data: {
            touristId: tourist.id,
            guideId: tour.guideId,
            tourId: tour.id,
            date: bookingDate,
            numberOfPeople,
            totalAmount,
        },
    });

    return booking;
};

// ===============================
// GET ALL BOOKINGS (ROLE BASED)
// ===============================
const getAllBookings = async (
    user: JwtPayload,
    filters: any,
    paginationOptions: IPaginationOptions
) => {
    const { page, limit, skip } =
        paginationHelper.calculatePagination(paginationOptions);

    const andConditions: any[] = [];

    // ===============================
    // ROLE BASED VISIBILITY
    // ===============================

    if (user.role === UserRole.TOURIST) {
        const tourist = await prisma.tourist.findFirstOrThrow({
            where: { user: { email: user.email } },
            select: { id: true },
        });

        andConditions.push({ touristId: tourist.id });
    }

    if (user.role === UserRole.GUIDE) {
        const guide = await prisma.guide.findFirstOrThrow({
            where: { user: { email: user.email } },
            select: { id: true },
        });

        andConditions.push({ guideId: guide.id });
    }

    // ADMIN → no restriction (sees all)

    // ===============================
    // FILTERS (status, tourId, etc.)
    // ===============================
    if (Object.keys(filters).length) {
        andConditions.push({
            AND: Object.entries(filters).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }

    const whereCondition =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const data = await prisma.booking.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            tour: true,
            tourist: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
            guide: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
        },
    });

    const total = await prisma.booking.count({
        where: whereCondition,
    });

    return {
        meta: { page, limit, total },
        data,
    };
};

export const getBookingByIdService = async (bookingId: string) => {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId,
        },
        include: {
            tour: true,
            tourist: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
            guide: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
        },
    });

    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
    }

    return booking;
};

// ===============================
// UPDATE BOOKING STATUS (GUIDE)
// ===============================
const updateBookingStatus = async (req: Request) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUniqueOrThrow({
        where: { id },
    });

    const guide = await prisma.guide.findFirstOrThrow({
        where: { userId: req.user!.userId },
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

const cancelBookingByTourist = async (req: Request) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUniqueOrThrow({
        where: { id },
    });

    const tourist = await prisma.tourist.findFirstOrThrow({
        where: { userId: req.user!.userId },
    });

    // ownership check
    if (booking.touristId !== tourist.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not allowed');
    }

    // 🔐 BOOKING WORKFLOW VALIDATION (ADD HERE 👇)

    // completed booking cannot be changed
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CONFIRMED) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Confirmed booking cannot be changed'
        );
    }

    // safe to update now
    return prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
    });
};


export const BookingServices = {
    createBooking,
    getAllBookings,
    getBookingByIdService,
    updateBookingStatus,
    cancelBookingByTourist
};
