import { Request } from 'express';
import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import ApiError from '../../errors/apiError';
import { BookingStatus } from '../../../generated/prisma/enums';
import { IAuthUser } from '../../interfaces/common';

// ===============================
// CREATE REVIEW (TOURIST)
// ===============================
const createReview = async (req: Request) => {
    const tourist = await prisma.tourist.findFirstOrThrow({
        where: {
            user: { email: req.user?.email },
        },
    });

    const booking = await prisma.booking.findUniqueOrThrow({
        where: { id: req.body.bookingId },
    });

    // booking ownership check
    if (booking.touristId !== tourist.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not your booking');
    }

    // only completed booking can be reviewed
    if (booking.status !== BookingStatus.COMPLETED) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'You can review only after booking is completed'
        );
    }

    // ensure one review per booking
    const alreadyReviewed = await prisma.review.findUnique({
        where: { bookingId: booking.id },
    });

    if (alreadyReviewed) {
        throw new ApiError(httpStatus.CONFLICT, 'Review already submitted');
    }

    const review = await prisma.review.create({
        data: {
            bookingId: booking.id,
            rating: req.body.rating,
            comment: req.body.comment,
            touristId: booking.touristId,
            guideId: booking.guideId,
            tourId: booking.tourId,
        },
    });

    return review;
};

// ===============================
// GET REVIEWS (PUBLIC)
// ===============================
const getReviews = async (filters: any) => {
    return prisma.review.findMany({
        where: filters,
        orderBy: { createdAt: 'desc' },
        include: {
            tourist: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
        },
    });
};

export const ReviewServices = {
    createReview,
    getReviews,
};
