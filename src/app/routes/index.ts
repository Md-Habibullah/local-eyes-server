import express from 'express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { UserRoutes } from '../modules/User/user.routes';
import { TourRoutes } from '../modules/Tour/tour.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { BookingRoutes } from '../modules/Booking/booking.route';

const router = express.Router();

router.use(apiLimiter); // Apply to all routes

const moduleRoutes = [
    {
        path: '/users',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/listing',
        route: TourRoutes
    },
    {
        path: '/booking',
        route: BookingRoutes
    },
    {
        path: '/payments',
        route: PaymentRoutes
    },
    // {
    //     path: '/admin',
    //     route: AdminRoutes
    // },
    // {
    //     path: '/auth',
    //     route: AuthRoutes
    // },
    // {
    //     path: '/doctor',
    //     route: DoctorRoutes
    // },
    // {
    //     path: '/patient',
    //     route: PatientRoutes
    // },
    // {
    //     path: '/payment',
    //     route: PaymentRoutes
    // },
    // {
    //     path: '/review',
    //     route: ReviewRoutes
    // },
    // {
    //     path: '/meta',
    //     route: MetaRoutes
    // }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;