import { z } from 'zod';

const createPayment = z.object({
    paymentMethod: z.string().optional(), // stripe / sslcommerz / cash
});

export const PaymentValidation = {
    createPayment,
};
