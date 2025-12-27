import * as bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import ApiError from '../../errors/apiError';
import { prisma } from '../../../lib/prisma';
import config from '../../../config';
import { UserRole, UserStatus } from '../../../generated/prisma/enums';
import { userSearchableFields } from './user.constant';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interfaces/pagination';
import { IAuthUser } from '../../interfaces/common';
import { get } from 'http';
import { Guide, Tourist } from '../../../generated/prisma/client';
import { fileUploader } from '../../../helpers/fileUploader';
import { Request } from 'express';


// get all users (admin)
const getAllUsers = async (
    filters: any,
    paginationOptions: IPaginationOptions
) => {
    const { searchTerm, ...filterData } = filters;

    const andConditions: any[] = [];

    // search by email
    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }

    // filter by email, role, status
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.entries(filterData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }

    const whereCondition = andConditions.length
        ? { AND: andConditions }
        : {};

    const { page, limit, skip } =
        paginationHelper.calculatePagination(paginationOptions);

    const result = await prisma.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            tourist: true,
            guide: true,
            admin: true,
        },
    });

    const total = await prisma.user.count({
        where: whereCondition,
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

// get my profile (me)

const getMyProfile = async (user: IAuthUser) => {
    const userInfo = await prisma.user.findFirstOrThrow({
        where: {
            email: user?.email,
            status: UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            needPasswordChange: true,
            role: true,
            status: true,
        },
    });

    let profileInfo;

    if (userInfo.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.findUnique({
            where: {
                userId: userInfo.id,
            },
            select: {
                id: true,
                name: true,
                profilePhoto: true,
                address: true,
                contactNumber: true,
                isSuper: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    } else if (userInfo.role === UserRole.GUIDE) {
        profileInfo = await prisma.guide.findUnique({
            where: {
                userId: userInfo.id,
            },
            select: {
                id: true,
                name: true,
                gender: true,
                profilePhoto: true,
                bio: true,
                address: true,
                contactNumber: true,
                languages: true,
                expertise: true,
                dailyRate: true,

                createdAt: true,
                updatedAt: true
            },
        });
    } else if (userInfo.role === UserRole.TOURIST) {
        profileInfo = await prisma.tourist.findUnique({
            where: {
                userId: userInfo.id,
            },
            select: {
                id: true,
                name: true,
                gender: true,
                profilePhoto: true,
                bio: true,
                address: true,
                contactNumber: true,
                languages: true,
                preferences: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    return { ...userInfo, ...profileInfo };
};

// get user by id (admin)
const getUserById = async (id: string) => {
    return prisma.user.findFirstOrThrow({
        where: {
            id,
            status: UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            role: true,

            tourist: {
                select: {
                    name: true,
                    gender: true,
                    profilePhoto: true,
                    bio: true,
                    address: true,
                    languages: true,
                    preferences: true,
                },
            },

            guide: {
                select: {
                    name: true,
                    gender: true,
                    profilePhoto: true,
                    bio: true,
                    address: true,
                    languages: true,
                    expertise: true,
                    dailyRate: true,
                    contactNumber: true
                },
            }
        },
    });
};


// get user by id (admin)
const getUserByIdAdminOnly = async (id: string) => {
    return prisma.user.findFirstOrThrow({
        where: { id },
        include: {
            tourist: true,
            guide: true,
            admin: true,
        },
    });
};

// update profile (me)
const updateProfile = async (user: IAuthUser, id: string, req: Request) => {
    const payload = { ...req.body };
    const userData = await prisma.user.findFirst({
        where: {
            id,
            email: user?.email,
            status: UserStatus.ACTIVE,
        },
    });

    if (!userData) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const file = req.file;
    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.profilePhoto = uploadToCloudinary?.secure_url;
    }

    let profileInfo;

    if (userData.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.update({
            where: { userId: userData.id },
            data: payload,
        });
    }

    if (userData.role === UserRole.TOURIST) {
        profileInfo = await prisma.tourist.update({
            where: { userId: userData.id },
            data: payload,
        });
    }

    if (userData.role === UserRole.GUIDE) {
        profileInfo = await prisma.guide.update({
            where: { userId: userData.id },
            data: payload,
        });
    }

    return { ...profileInfo };
};

// block and unblock user (admin)
const blockUser = async (id: string) => {

    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (user.role === UserRole.ADMIN) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot block an admin user');
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User is already blocked');
    }

    return prisma.user.update({
        where: { id },
        data: { status: UserStatus.BLOCKED },
    });
};

const unblockUser = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (user.status === UserStatus.ACTIVE) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User is already active');
    }

    return prisma.user.update({
        where: { id },
        data: { status: UserStatus.ACTIVE },
    });
}

export const UserServices = {
    getAllUsers,
    getMyProfile,
    getUserById,
    getUserByIdAdminOnly,
    updateProfile,
    blockUser,
    unblockUser
};
