import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.post(
    '/booking/:bookingId',
    auth(UserRole.TOURIST),
    PaymentController.initPayment
);

router.post(
    '/sslcommerz/success',
    PaymentController.paymentSuccess
);
router.get('/sslcommerz/success', PaymentController.paymentSuccess);

router.post(
    '/sslcommerz/fail',
    PaymentController.paymentFail
);
router.get('/sslcommerz/fail', PaymentController.paymentFail);

router.post(
    '/sslcommerz/cancel',
    PaymentController.paymentFail
);
router.get('/sslcommerz/cancel', PaymentController.paymentFail);

export const PaymentRoutes = router;
