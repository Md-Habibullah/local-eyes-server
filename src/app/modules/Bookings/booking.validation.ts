import { z } from "zod";
import { BookingStatus } from "../../../generated/prisma/enums";

/**
 * Accepts:
 *  - YYYY-MM-DD
 *  - ISO datetime string
 * Converts to Date
 */
const dateSchema = z.preprocess((value) => {
    if (typeof value === "string") {
        // Date-only → force UTC midnight
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return new Date(`${value}T00:00:00.000Z`);
        }

        // ISO datetime
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    return value;
}, z.date());

const createBooking = z.object({
    tourId: z.string().uuid(),
    date: dateSchema,
    numberOfPeople: z.number().int().min(1),
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
