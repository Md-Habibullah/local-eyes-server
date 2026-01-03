import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserRole } from '../../../generated/prisma/enums';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';

const router = express.Router();

router.post(
    '/',
    auth(UserRole.TOURIST),
    validateRequest(BookingValidation.createBooking),
    BookingController.createBooking
);

router.get(
    '/',
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
    BookingController.getAllBookings
);

router.patch(
    '/:id',
    auth(UserRole.GUIDE),
    validateRequest(BookingValidation.updateBookingStatus),
    BookingController.updateBookingStatus
);

router.patch(
    '/:id/cancel',
    auth(UserRole.TOURIST),
    validateRequest(BookingValidation.cancelBooking),
    BookingController.updateBookingStatus
);

export const BookingRoutes = router;
