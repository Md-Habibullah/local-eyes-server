// src/app/modules/wishlist/wishlist.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { WishlistServices } from "./wishlist.service";

const addToWishlist = catchAsync(
    async (req: Request, res: Response) => {
        const touristId = req.user?.tourist?.id || '';
        const { tourId } = req.body;

        const result = await WishlistServices.addToWishlist(touristId, tourId);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Tour added to wishlist",
            data: result,
        });
    }
);

const removeFromWishlist = catchAsync(
    async (req: Request, res: Response) => {
        const touristId = req.user?.tourist?.id || '';
        const { tourId } = req.params;

        await WishlistServices.removeFromWishlist(touristId, tourId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Tour removed from wishlist",
            data: null,
        });
    }
);

const getMyWishlist = catchAsync(
    async (req: Request, res: Response) => {
        const touristId = req.user?.tourist?.id || '';

        const result = await WishlistServices.getMyWishlist(touristId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Wishlist retrieved successfully",
            data: result,
        });
    }
);

export const WishlistController = {
    addToWishlist,
    removeFromWishlist,
    getMyWishlist,
};
