import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { PaymentServices } from './payment.service';
import config from '../../../config';

const initPayment = catchAsync(
    async (req: Request, res: Response) => {
        const result = await PaymentServices.initPayment(req);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Redirect to payment gateway',
            data: result,
        });
    }
);

const paymentSuccess = catchAsync(
    async (req: Request, res: Response) => {
        const { tran_id } = req.body;

        await PaymentServices.paymentSuccess(tran_id);

        res.redirect(`${config.frontend_url}/payment-success`);
    }
);

const paymentFail = (_req: Request, res: Response) => {
    res.redirect(`${config.frontend_url}/payment-failed`);
};

export const PaymentController = {
    initPayment,
    paymentSuccess,
    paymentFail,
};
