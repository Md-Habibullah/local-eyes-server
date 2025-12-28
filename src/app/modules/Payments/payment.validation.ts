import { z } from 'zod';

const createPayment = z.object({
    bookingId: z.string(),
    paymentMethod: z.string().optional(), // stripe / sslcommerz / cash
});

export const PaymentValidation = {
    createPayment,
};
