import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/apiError';
import { prisma } from '../../../lib/prisma';
import { initSSLCommerzPayment } from '../../../helpers/sslcommerz';
import {
    BookingStatus,
    PaymentStatus,
} from '../../../generated/prisma/enums';
import config from '../../../config';

// ===============================
// INIT SSL PAYMENT (TOURIST)
// ===============================
const initPayment = async (req: Request & { user?: any }) => {
    const tourist = await prisma.tourist.findFirstOrThrow({
        where: { user: { email: req.user.email } },
    });

    const booking = await prisma.booking.findUniqueOrThrow({
        where: { id: req.body.bookingId },
    });

    if (booking.touristId !== tourist.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not your booking');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Booking must be confirmed before payment'
        );
    }

    if (booking.isPaid) {
        throw new ApiError(httpStatus.CONFLICT, 'Already paid');
    }

    const transactionId = `TXN-${Date.now()}`;

    // create pending payment
    await prisma.payment.create({
        data: {
            bookingId: booking.id,
            amount: booking.totalAmount,
            status: PaymentStatus.PENDING,
            paymentMethod: 'sslcommerz',
            transactionId,
        },
    });

    const paymentPayload = {
        store_id: config.sslcommerz.store_id,
        store_passwd: config.sslcommerz.store_password,
        total_amount: booking.totalAmount,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: config.sslcommerz.success_url,
        fail_url: config.sslcommerz.fail_url,
        cancel_url: config.sslcommerz.cancel_url,
        product_name: 'Tour Booking',
        product_category: 'Tour',
        product_profile: 'general',
        cus_name: tourist.name,
        cus_email: req.user.email,
        cus_add1: tourist.address || 'Dhaka',
        cus_phone: tourist.contactNumber || '01700000000',
    };

    const sslResponse = await initSSLCommerzPayment(paymentPayload);

    if (!sslResponse?.GatewayPageURL) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Failed to initiate payment'
        );
    }

    return { paymentUrl: sslResponse.GatewayPageURL };
};

// ===============================
// PAYMENT SUCCESS HANDLER
// ===============================
const paymentSuccess = async (tranId: string) => {
    return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirstOrThrow({
            where: { transactionId: tranId },
        });

        await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.COMPLETED,
            },
        });

        await tx.booking.update({
            where: { id: payment.bookingId },
            data: {
                isPaid: true,
                paymentStatus: PaymentStatus.COMPLETED,
                paidAt: new Date(),
            },
        });
    });
};

export const PaymentServices = {
    initPayment,
    paymentSuccess,
};
