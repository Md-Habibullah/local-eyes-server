// src/app/modules/wishlist/wishlist.service.ts
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/apiError";
import httpStatus from "http-status";

const addToWishlist = async (touristId: string, tourId: string) => {
    // prevent duplicate
    const exists = await prisma.wishlist.findUnique({
        where: {
            touristId_tourId: {
                touristId,
                tourId,
            },
        },
    });

    if (exists) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Tour already added to wishlist"
        );
    }

    const wishlist = await prisma.wishlist.create({
        data: {
            touristId,
            tourId,
        },
    });

    return wishlist;
};

const removeFromWishlist = async (touristId: string, tourId: string) => {
    await prisma.wishlist.delete({
        where: {
            touristId_tourId: {
                touristId,
                tourId,
            },
        },
    });

    return true;
};

const getMyWishlist = async (touristId: string) => {
    const wishlist = await prisma.wishlist.findMany({
        where: { touristId },
        include: {
            tour: {
                include: {
                    guide: {
                        select: {
                            id: true,
                            name: true,
                            profilePhoto: true,
                            isVerified: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return wishlist;
};

export const WishlistServices = {
    addToWishlist,
    removeFromWishlist,
    getMyWishlist,
};
