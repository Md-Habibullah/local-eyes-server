// src/app/modules/guide/guide.route.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';
import { GuideController } from './guide.controller';

const router = express.Router();

router.get(
    '/',
    GuideController.getAllGuides
);

router.get(
    "/unpaid-earnings",
    auth(UserRole.GUIDE),
    GuideController.getGuideUnpaidEarnings
);

router.get(
    "/earnings",
    auth(UserRole.ADMIN),
    GuideController.getAllGuidesUnpaidEarnings
);

router.get(
    '/:id',
    auth(UserRole.GUIDE, UserRole.TOURIST, UserRole.ADMIN),
    GuideController.getGuideById
);


router.post(
    '/verify/send-otp',
    auth(UserRole.GUIDE),
    GuideController.sendOtp
);

router.post(
    '/verify/confirm',
    auth(UserRole.GUIDE),
    GuideController.verifyOtp
);

router.post(
    '/verify/resend-otp',
    auth(UserRole.GUIDE),
    GuideController.resendOtp
);


export const GuideRoutes = router;