import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/apiError";
import httpStatus from "http-status";
import { JwtPayload } from "../../interfaces/jwt.interface";

const addToWishlist = async (user: JwtPayload, tourId: string) => {
    // 1 get tourist profile from userId
    const tourist = await prisma.tourist.findUnique({
        where: { userId: user.userId },
        select: { id: true },
    });

    if (!tourist) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "Only tourists can add to wishlist"
        );
    }

    // 2 check duplicate
    const exists = await prisma.wishlist.findUnique({
        where: {
            touristId_tourId: {
                touristId: tourist.id,
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

    // 3 create wishlist
    const wishlist = await prisma.wishlist.create({
        data: {
            touristId: tourist.id,
            tourId,
        },
    });

    return wishlist;
};

const removeFromWishlist = async (user: JwtPayload, tourId: string) => {
    // 1 get tourist profile
    const tourist = await prisma.tourist.findUnique({
        where: { userId: user.userId },
        select: { id: true },
    });

    if (!tourist) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "Only tourists can remove from wishlist"
        );
    }

    // 2 delete wishlist item
    const result = await prisma.wishlist.deleteMany({
        where: {
            touristId: tourist.id,
            tourId,
        },
    });

    if (result.count === 0) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Wishlist item not found"
        );
    }

    return true;
};

const getMyWishlist = async (user: JwtPayload) => {
    // 1 get tourist profile
    const tourist = await prisma.tourist.findUnique({
        where: { userId: user.userId },
        select: { id: true },
    });

    if (!tourist) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "Only tourists can view wishlist"
        );
    }

    // 2 fetch wishlist
    const wishlist = await prisma.wishlist.findMany({
        where: { touristId: tourist.id },
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
