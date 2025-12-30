import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/apiError';
import { prisma } from '../../../lib/prisma';
import { fileUploader } from '../../../helpers/fileUploader';
import { paginationHelper } from '../../../helpers/paginationHelper';
// import { IPaginationOptions } from '../../interface/pagination';
import {
    tourSearchableFields,
} from './listings.constant';
import {
    UserRole,
    UserStatus,
} from '../../../generated/prisma/enums';
import { IPaginationOptions } from '../../interfaces/pagination';
import { JwtPayload } from '../../interfaces/jwt.interface';

// ===============================
// CREATE TOUR
// ===============================
const createTour = async (req: Request) => {
    // const guide = await prisma.guide.findFirstOrThrow({
    //     where: {
    //         user: {
    //             email: req.user?.email,
    //             role: UserRole.GUIDE,
    //             status: UserStatus.ACTIVE,
    //         },
    //     },
    // });
    const guide = await prisma.guide.findFirstOrThrow({
        where: { userId: req.user!.userId },
    });

    //! will be added at leter
    // if (!guide.isVerified) {
    //     throw new ApiError(
    //         httpStatus.FORBIDDEN,
    //         'Please verify your guide profile first'
    //     );
    // }

    const file = req.file;

    if (file) {
        const uploadedImage = await fileUploader.uploadToCloudinary(file);
        req.body.images = [uploadedImage.secure_url];
    }

    const tour = await prisma.tour.create({
        data: {
            ...req.body,
            guideId: guide.id,
        },
    });

    return tour;
};

// ===============================
// UPDATE TOUR
// ===============================
const updateTour = async (req: Request) => {
    const { id } = req.params;

    const existingTour = await prisma.tour.findUniqueOrThrow({
        where: { id },
    });

    // const guide = await prisma.guide.findFirstOrThrow({
    //     where: {
    //         user: {
    //             email: req.user?.email,
    //             role: UserRole.GUIDE,
    //         },
    //     },
    // });
    const guide = await prisma.guide.findFirstOrThrow({
        where: { userId: req.user!.userId },
    });

    //! will be added at leter
    // if (!guide.isVerified) {
    //     throw new ApiError(
    //         httpStatus.FORBIDDEN,
    //         'Please verify your guide profile first'
    //     );
    // }

    if (existingTour.guideId !== guide.id) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'You are not allowed to update this tour'
        );
    }

    const file = req.file;

    if (file) {
        const uploadedImage = await fileUploader.uploadToCloudinary(file);
        req.body.images = [uploadedImage.secure_url];
    }

    const updatedTour = await prisma.tour.update({
        where: { id },
        data: req.body,
    });

    return updatedTour;
};

// ===============================
// GET ALL TOURS (SEARCH + FILTER + PAGINATION)
// ===============================
const getAllTours = async (
    filters: any,
    paginationOptions: IPaginationOptions
) => {
    const { searchTerm, ...filterData } = filters;

    const andConditions: any[] = [];

    // SEARCH
    if (searchTerm) {
        andConditions.push({
            OR: tourSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }

    // PRICE RANGE FILTER (minPrice & maxPrice)
    if (filterData.minPrice || filterData.maxPrice) {
        andConditions.push({
            price: {
                gte: filterData.minPrice
                    ? Number(filterData.minPrice)
                    : undefined,
                lte: filterData.maxPrice
                    ? Number(filterData.maxPrice)
                    : undefined,
            },
        });

        // important: remove handled fields
        delete filterData.minPrice;
        delete filterData.maxPrice;
    }

    // OTHER FILTERS (city, category, guideId, etc.)
    if (Object.keys(filterData).length) {
        andConditions.push({
            AND: Object.entries(filterData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }

    // ONLY ACTIVE TOURS
    andConditions.push({
        isActive: true,
    });

    const whereConditions =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const { page, limit, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(paginationOptions);

    const result = await prisma.tour.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            sortBy && sortOrder
                ? { [sortBy]: sortOrder }
                : { createdAt: 'desc' },
        include: {
            guide: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
        },
    });

    const total = await prisma.tour.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
};


// ===============================
// GET SINGLE TOUR
// ===============================
const getTourById = async (id: string) => {
    const tour = await prisma.tour.findUnique({
        where: {
            id,
            isActive: true,
        },
        include: {
            guide: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                    bio: true,
                    languages: true,
                    dailyRate: true,
                },
            },
            reviews: {
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    tourist: {
                        select: {
                            id: true,
                            name: true,
                            profilePhoto: true,
                        },
                    },
                },
            },
        },
    });

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found")
    }

    return tour;
};

// get my tour
const getMyTours = async (req: Request) => {
    const query = req.query;
    const user = req.user as JwtPayload;
    const userId = user?.userId;

    if (user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.FORBIDDEN, "Only guide can see his listings")
    }

    const guide = await prisma.guide.findFirst({
        where: { userId },
    });

    if (!guide) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide not found");
    }

    const {
        searchTerm,
        city,
        category,
        minPrice,
        maxPrice,
        isActive,
        page = 1,
        limit = 10,
    } = query;

    const andConditions: any[] = [];

    // 🔐 force guide ownership
    andConditions.push({
        guideId: guide.id,
        isActive: true
    });

    // 🔍 search
    if (searchTerm) {
        andConditions.push({
            OR: tourSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    // 🎯 filters
    if (city) {
        andConditions.push({ city });
    }

    if (category) {
        andConditions.push({ category });
    }

    if (isActive !== undefined) {
        andConditions.push({
            isActive: isActive === "true",
        });
    }

    // 💰 price range
    if (minPrice || maxPrice) {
        const priceCondition: any = {};
        if (minPrice) priceCondition.gte = Number(minPrice);
        if (maxPrice) priceCondition.lte = Number(maxPrice);

        andConditions.push({
            price: priceCondition,
        });
    }

    // 🧠 final where
    const whereConditions =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const skip = (Number(page) - 1) * Number(limit);

    const [tours, total] = await prisma.$transaction([
        prisma.tour.findMany({
            where: whereConditions,
            skip,
            take: Number(limit),
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.tour.count({
            where: whereConditions,
        }),
    ]);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
        data: tours,
    };
};

// ===============================
// DELETE TOUR (SOFT DELETE)
// ===============================
const deleteTour = async (req: Request) => {
    const { id } = req.params;

    const tour = await prisma.tour.findUniqueOrThrow({
        where: { id },
    });

    // const guide = await prisma.guide.findFirstOrThrow({
    //     where: {
    //         user: {
    //             email: req.user?.email,
    //         },
    //     },
    // });
    const guide = await prisma.guide.findFirstOrThrow({
        where: { userId: req.user!.userId },
    });

    if (tour.guideId !== guide.id) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'You are not allowed to delete this tour'
        );
    }

    const deletedTour = await prisma.tour.update({
        where: { id },
        data: {
            isActive: false,
        },
    });

    return deletedTour;
};

export const TourServices = {
    createTour,
    updateTour,
    getAllTours,
    getTourById,
    getMyTours,
    deleteTour,
};
