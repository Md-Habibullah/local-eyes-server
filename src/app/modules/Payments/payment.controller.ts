import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { PaymentServices } from './payment.service';
import config from '../../../config';
import ApiError from '../../errors/apiError';

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

// const paymentSuccess = catchAsync(
//     async (req: Request, res: Response) => {
//         const { tran_id } = req.body;

//         await PaymentServices.paymentSuccess(tran_id);

//         res.redirect(`${config.frontend_url}/payment-success`);
//     }
// );
const paymentSuccess = catchAsync(
    async (req: Request, res: Response) => {

        const tran_id = req.body.tran_id || req.query.tran_id;

        if (!tran_id) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Invalid transaction'
            );
        }

        await PaymentServices.paymentSuccess(tran_id as string);

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
