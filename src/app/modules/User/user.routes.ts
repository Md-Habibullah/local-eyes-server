import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { fileUploader } from '../../../helpers/fileUploader';

const router = express.Router();

router.get(
    '/',
    auth(UserRole.ADMIN),
    UserController.getAllUsers
);

router.get(
    '/me',
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
    UserController.getMyProfile
)


router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.updateProfile.parse(JSON.parse(req.body.data))
        return UserController.updateProfile(req, res, next)
    }
);

// public get user by id
router.get(
    '/:id',
    UserController.getUserById
);

router.get(
    '/:id/adminonly',
    auth(UserRole.ADMIN),
    UserController.getUserByIdAdminOnly
);


router.patch(
    '/:id/block',
    auth(UserRole.ADMIN),
    UserController.blockUser
);

router.patch(
    '/:id/unblock',
    auth(UserRole.ADMIN),
    UserController.unblockUser
);

export const UserRoutes = router;
