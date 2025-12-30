import express, { Request, Response, NextFunction } from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';
import { TourController } from './listings.controller';
import { TourValidation } from './listings.validation';
import { fileUploader } from '../../../helpers/fileUploader';

const router = express.Router();

// CREATE TOUR
router.post(
    '/',
    auth(UserRole.GUIDE),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = TourValidation.createTour.parse(
            JSON.parse(req.body.data)
        );
        return TourController.createTour(req, res, next);
    }
);


router.get(
    '/',
    TourController.getAllTours
);

router.get(
    "/my-listings",
    auth(UserRole.GUIDE),
    TourController.getMyTours
);

router.get(
    '/:id',
    TourController.getTourById
);


// UPDATE TOUR
router.patch(
    '/:id',
    auth(UserRole.GUIDE),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = TourValidation.updateTour.parse(
            JSON.parse(req.body.data)
        );
        return TourController.updateTour(req, res, next);
    }
);

router.delete(
    '/:id',
    auth(UserRole.GUIDE, UserRole.ADMIN),
    TourController.deleteTour
);

export const TourRoutes = router;
