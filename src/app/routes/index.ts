import express from 'express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { UserRoutes } from '../modules/Users/user.routes';
import { TourRoutes } from '../modules/Listings/listings.route';
import { PaymentRoutes } from '../modules/Payments/payment.route';
import { BookingRoutes } from '../modules/Bookings/booking.route';
import { ReviewRoutes } from '../modules/Reviews/review.routes';
import { WishlistRoutes } from '../modules/Wishlist/wishlist.route';
import { GuideRoutes } from '../modules/Guides/guide.routes';

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
        path: '/guides',
        route: GuideRoutes
    },
    {
        path: '/payments',
        route: PaymentRoutes
    },
    {
        path: '/reviews',
        route: ReviewRoutes
    },
    {
        path: '/wishlists',
        route: WishlistRoutes
    }
    // {
    //     path: '/meta',
    //     route: MetaRoutes
    // }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;