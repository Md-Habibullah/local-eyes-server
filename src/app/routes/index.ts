import express from 'express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { UserRoutes } from '../modules/User/user.routes';
import { TourRoutes } from '../modules/Listings/listings.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { BookingRoutes } from '../modules/Booking/booking.route';
import { ReviewRoutes } from '../modules/Review/review.routes';

const router = express.Router();

router.use(apiLimiter); // Apply to all routes

const moduleRoutes = [
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/users',
        route: UserRoutes
    },
    {
        path: '/listings',
        route: TourRoutes
    },
    {
        path: '/bookings',
        route: BookingRoutes
    },
    {
        path: '/payments',
        route: PaymentRoutes
    },
    {
        path: '/reviews',
        route: ReviewRoutes
    }
    // {
    //     path: '/meta',
    //     route: MetaRoutes
    // }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;