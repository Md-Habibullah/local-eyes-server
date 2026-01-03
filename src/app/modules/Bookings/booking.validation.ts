import { z } from "zod";
import { BookingStatus } from "../../../generated/prisma/enums";

const dateSchema = z.preprocess((value) => {
    if (typeof value === "string") {
        // date only → normalize to UTC midnight
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return new Date(`${value}T00:00:00.000Z`);
        }

        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    if (value instanceof Date) {
        return value;
    }

    return undefined;
}, z.date());

const createBooking = z.object({
    body: z.object({
        tourId: z
            .string({
                error: "tourId is required",
            })
            .uuid("Invalid tourId format"),

        date: dateSchema,

        numberOfPeople: z
            .number({
                error: "numberOfPeople is required",
            })
            .int("numberOfPeople must be an integer")
            .min(1, "At least 1 person required"),
    }),
});

const updateBookingStatus = z.object({
    body: z.object(
        {
            status: z.enum([
                BookingStatus.CONFIRMED,
                BookingStatus.CANCELLED,
                BookingStatus.COMPLETED,
            ]),
        }
    )
});

const cancelBooking = z.object({
    body: z.object(
        {
            status: z.enum([
                BookingStatus.CANCELLED,
            ]),
        }
    )
});

export const BookingValidation = {
    createBooking,
    updateBookingStatus,
    cancelBooking
};
