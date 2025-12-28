import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { UserServices } from './user.service';
import { userFilterableFields } from './user.constant';
import { paginationFields } from '../../constrains';
import { IAuthUser } from '../../interfaces/common';


const getMyProfile = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {

    const user = req.user;

    const result = await UserServices.getMyProfile(user as IAuthUser);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My profile data fetched!",
        data: result
    })
});

// get all users (admin)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, userFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await UserServices.getAllUsers(
        filters,
        paginationOptions
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

// get user by id (public)
const getUserById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await UserServices.getUserById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});

// get user by id (admin)
const getUserByIdAdminOnly = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await UserServices.getUserByIdAdminOnly(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});



// update profile (me)
const updateProfile = catchAsync(
    async (req: Request & { user?: IAuthUser }, res: Response) => {
        const user = req.user;
        const { id } = req.params;

        const result = await UserServices.updateProfile(user as IAuthUser, id, req);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Profile updated successfully',
            data: result,
        });
    }
);

// block and unblock user (admin)
const blockUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await UserServices.blockUser(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User blocked successfully',
        data: result,
    });
});
const unblockUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await UserServices.unblockUser(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User blocked successfully',
        data: result,
    });
});

export const UserController = {
    getAllUsers,
    getUserById,
    getUserByIdAdminOnly,
    updateProfile,
    blockUser,
    unblockUser,
    getMyProfile
};
