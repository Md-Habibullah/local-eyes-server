import { z } from 'zod';

const createReview = z.object({
    body: z.object({
        bookingId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
    })
});

export const ReviewValidation = {
    createReview,
};
