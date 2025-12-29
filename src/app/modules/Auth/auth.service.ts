// import { UserStatus } from "@prisma/client";
import * as bcrypt from 'bcryptjs';
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import ApiError from "../../errors/apiError";
import emailSender from "./emailSender";
import { UserRole, UserStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../../lib/prisma';
import { fileUploader } from '../../../helpers/fileUploader';
import { Request } from 'express';
import { email } from 'zod';
import { JwtPayload } from '../../interfaces/jwt.interface';


// create user (register)
const createUser = async (req: Request) => {

    const isUserExist = await prisma.user.findFirst({
        where: { email: req.body.user.email },
    });

    if (isUserExist) {
        throw new ApiError(httpStatus.CONFLICT, 'User already exists!');
    }

    const file = req.file;

    if (file) {
        const uploadedProfileImage = await fileUploader.uploadToCloudinary(file);
        req.body.user.profilePhoto = uploadedProfileImage?.secure_url;
    }

    const hashedPassword = await bcrypt.hash(
        req.body.password,
        Number(config.salt_round)
    );

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: req.body.user.email,
                password: hashedPassword,
                role: req.body.user.role,
                needPasswordChange: false,
            },
        });

        await tx.authProviderModel.create({
            data: {
                provider: 'CREDENTIALS',
                providerId: req.body.user.email,
                userId: user.id
            }
        })

        if (req.body.user.role === UserRole.TOURIST) {
            await tx.tourist.create({
                data: {
                    userId: user.id,
                    name: req.body.user.name,
                    gender: req.body.user.gender,
                    profilePhoto: req.body.user.profilePhoto,
                    bio: req.body.user.bio,
                    address: req.body.user.address,
                    contactNumber: req.body.user.contactNumber,
                    languages: req.body.user.languages || [],
                    preferences: req.body.user.preferences,
                },
            });
        }

        if (req.body.user.role === UserRole.GUIDE) {
            await tx.guide.create({
                data: {
                    userId: user.id,
                    name: req.body.user.name,
                    gender: req.body.user.gender,
                    profilePhoto: req.body.user.profilePhoto,
                    bio: req.body.user.bio,
                    address: req.body.user.address,
                    contactNumber: req.body.user.contactNumber,
                    languages: req.body.user.languages || [],
                    expertise: req.body.user.expertise || [],
                    dailyRate: req.body.user.dailyRate || 0,
                },
            });
        }

        // if (payload.role === UserRole.ADMIN) {
        //     await tx.admin.create({
        //         data: {
        //             userId: user.id,
        //             name: payload.name,
        //             profilePhoto: payload.profilePhoto,
        //             address: payload.address,
        //             contactNumber: payload.contactNumber,
        //         },
        //     });
        // }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    });
};


const loginUser = async (payload: {
    email: string,
    password: string
}) => {
    const userData = await prisma.user.findFirst({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });

    if (!userData) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User does not exists!");
    }

    const isCorrectPassword: boolean = await bcrypt.compare(payload.password, userData.password);

    if (!isCorrectPassword) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Password incorrect!");

    }
    const accessToken = jwtHelpers.generateToken({
        userId: userData.id,
        email: userData.email,
        role: userData.role
    },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.generateToken({
        userId: userData.id,
        email: userData.email,
        role: userData.role
    },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string
    );

    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData.needPasswordChange
    };
};

const refreshToken = async (token: string) => {
    let decodedData;
    try {
        decodedData = jwtHelpers.verifyToken(token, config.jwt.refresh_token_secret as Secret);
    }
    catch (err) {
        throw new Error("You are not authorized!")
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    });

    const accessToken = jwtHelpers.generateToken({
        userId: userData.id,
        email: userData.email,
        role: userData.role
    },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.generateToken({
        userId: userData.id,
        email: userData.email,
        role: userData.role
    },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string
    );

    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData.needPasswordChange
    };

};

const changePassword = async (user: JwtPayload, payload: any) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        }
    });

    const isCorrectPassword: boolean = await bcrypt.compare(payload.oldPassword, userData.password);

    if (!isCorrectPassword) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Old password is incorrect!");
    }

    const hashedPassword: string = await bcrypt.hash(payload.newPassword, Number(config.salt_round));

    await prisma.user.update({
        where: {
            email: userData.email
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    })

    return {
        message: "Password changed successfully!"
    }
};

const forgotPassword = async (payload: { email: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });

    const resetPassToken = jwtHelpers.generateToken(
        { email: userData.email, userId: userData.id, role: userData.role },
        config.jwt.reset_pass_secret as Secret,
        config.jwt.reset_pass_token_expires_in as string
    )

    const resetPassLink = config.reset_pass_link + `?email=${encodeURIComponent(userData.email)}&token=${resetPassToken}`

    await emailSender(
        userData.email,
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Local Eyes</h1>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">
                                        Hello,
                                    </p>
                                    <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 24px;">
                                        We received a request to reset your password for your Local Eyes account. Click the button below to create a new password:
                                    </p>
                                    <!-- Button -->
                                    <table role="presentation" style="margin: 0 auto;">
                                        <tr>
                                            <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                                <a href="${resetPassLink}" style="border: none; color: #ffffff; padding: 14px 32px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block; border-radius: 6px;">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 20px;">
                                        Or copy and paste this link into your browser:
                                    </p>
                                    <p style="margin: 0 0 30px 0; color: #667eea; font-size: 14px; line-height: 20px; word-break: break-all;">
                                        ${resetPassLink}
                                    </p>
                                    <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">
                                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 20px;">
                                            <strong>Security Notice:</strong>
                                        </p>
                                        <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #999999; font-size: 14px; line-height: 20px;">
                                            <li>This link will expire in 15 minutes</li>
                                            <li>If you didn't request this password reset, please ignore this email</li>
                                            <li>For security reasons, never share this link with anyone</li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                                        © ${new Date().getFullYear()} Local Eyes. All rights reserved.
                                    </p>
                                    <p style="margin: 0; color: #999999; font-size: 12px;">
                                        This is an automated email. Please do not reply.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `
    )
};

const resetPassword = async (token: string | null, payload: { email?: string, password: string }, user?: { email: string }) => {
    let userEmail: string;

    // Case 1: Token-based reset (from forgot password email)
    if (token) {
        const decodedToken = jwtHelpers.verifyToken(token, config.jwt.reset_pass_secret as Secret)

        if (!decodedToken) {
            throw new ApiError(httpStatus.FORBIDDEN, "Invalid or expired reset token!")
        }

        // Verify email from token matches the email in payload
        if (payload.email && decodedToken.email !== payload.email) {
            throw new ApiError(httpStatus.FORBIDDEN, "Email mismatch! Invalid reset request.")
        }

        userEmail = decodedToken.email;
    }
    // Case 2: Authenticated user with needPasswordChange (newly created admin/doctor)
    else if (user && user.email) {
        console.log({ user }, "needpassworchange");
        const authenticatedUser = await prisma.user.findUniqueOrThrow({
            where: {
                email: user.email,
                status: UserStatus.ACTIVE
            }
        });

        // Verify user actually needs password change
        if (!authenticatedUser.needPasswordChange) {
            throw new ApiError(httpStatus.BAD_REQUEST, "You don't need to reset your password. Use change password instead.")
        }

        userEmail = user.email;
    } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid request. Either provide a valid token or be authenticated.")
    }

    // hash password
    const password = await bcrypt.hash(payload.password, Number(config.salt_round));

    // update into database
    await prisma.user.update({
        where: {
            email: userEmail
        },
        data: {
            password,
            needPasswordChange: false
        }
    })
};

const getMe = async (user: { accessToken: string; refreshToken: string }) => {
    const accessToken = user?.accessToken;
    const decodedData = jwtHelpers.verifyToken(accessToken, config.jwt.jwt_secret as Secret);

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            admin: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                    address: true,
                    isSuper: true,
                    contactNumber: true,
                    createdAt: true,
                    updatedAt: true,
                }
            },
            guide: {
                select: {
                    id: true,
                    name: true,
                    gender: true,
                    profilePhoto: true,
                    bio: true,
                    contactNumber: true,
                    address: true,
                    languages: true,
                    expertise: true,
                    dailyRate: true,
                    createdAt: true,
                    updatedAt: true,
                }
            },
            tourist: {
                select: {
                    id: true,
                    name: true,
                    gender: true,
                    profilePhoto: true,
                    bio: true,
                    contactNumber: true,
                    address: true,
                    languages: true,
                    preferences: true,
                    createdAt: true,
                    updatedAt: true,

                }
            }
        }
    });

    return userData;
}


export const AuthServices = {
    createUser,
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    getMe
}