// src/app/modules/guide/guide.route.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';
import { GuideController } from './guide.controller';

const router = express.Router();

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
