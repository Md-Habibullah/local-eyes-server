import { z } from 'zod';
import { BookingStatus } from '../../../generated/prisma/enums';

const createBooking = z.object({
    tourId: z.string(),
    date: z.string().datetime(),
    numberOfPeople: z.number().min(1),
});

const updateBookingStatus = z.object({
    status: z.enum([
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
        BookingStatus.COMPLETED,
    ]),
});

export const BookingValidation = {
    createBooking,
    updateBookingStatus,
};
