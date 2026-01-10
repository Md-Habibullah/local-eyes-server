// src/app/modules/wishlist/wishlist.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { WishlistServices } from "./wishlist.service";
import { JwtPayload } from "../../interfaces/jwt.interface";

// const addToWishlist = catchAsync(
//     async (req: Request, res: Response) => {
//         const user = req.user as JwtPayload;
//         const { tourId } = req.body;

//         const result = await WishlistServices.addToWishlist(user, tourId);

//         sendResponse(res, {
//             statusCode: httpStatus.CREATED,
//             success: true,
//             message: "Tour added to wishlist",
//             data: result,
//         });
//     }
// );

const removeFromWishlist = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user as JwtPayload;
        const { tourId } = req.params;

        await WishlistServices.removeFromWishlist(user, tourId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Tour removed from wishlist",
            data: null,
        });
    }
);

const toggleWishlist = catchAsync(async (req, res) => {
    const user = req.user as JwtPayload;
    const { tourId } = req.body;

    const result = await WishlistServices.toggleWishlist(user, tourId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: {
            action: result.action, // ADDED | REMOVED
        },
    });
});


const getMyWishlist = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user as JwtPayload;

        const result = await WishlistServices.getMyWishlist(user);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Wishlist retrieved successfully",
            data: result,
        });
    }
);

export const checkWishlist = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user as JwtPayload; // from auth middleware
        const { tourId } = req.params;

        const result = await WishlistServices.checkWishlist(user, tourId);

        res.status(200).json({
            success: true,
            ...result,
        });
    }
);

export const WishlistController = {
    // addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    getMyWishlist,
    checkWishlist
};
