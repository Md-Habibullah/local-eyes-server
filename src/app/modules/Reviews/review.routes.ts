import express from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
    '/',
    auth(UserRole.TOURIST),
    validateRequest(ReviewValidation.createReview),
    ReviewController.createReview
);

router.get('/', ReviewController.getReviews);

export const ReviewRoutes = router;
