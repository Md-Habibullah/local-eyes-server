import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import ApiError from "../../errors/apiError";
import jwt, { Secret } from "jsonwebtoken"
import { jwtHelpers } from "../../../helpers/jwtHelpers";

// register user
const createUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.createUser(req);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User registered successfully',
        data: result,
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const accessTokenExpiresIn = config.jwt.expires_in as string;
    const refreshTokenExpiresIn = config.jwt.refresh_token_expires_in as string;

    // convert accessTokenExpiresIn to milliseconds
    let accessTokenMaxAge = 0;
    const accessTokenUnit = accessTokenExpiresIn.slice(-1);
    const accessTokenValue = parseInt(accessTokenExpiresIn.slice(0, -1));
    if (accessTokenUnit === "y") {
        accessTokenMaxAge = accessTokenValue * 365 * 24 * 60 * 60 * 1000;
    }
    else if (accessTokenUnit === "M") {
        accessTokenMaxAge = accessTokenValue * 30 * 24 * 60 * 60 * 1000;
    }
    else if (accessTokenUnit === "w") {
        accessTokenMaxAge = accessTokenValue * 7 * 24 * 60 * 60 * 1000;
    }
    else if (accessTokenUnit === "d") {
        accessTokenMaxAge = accessTokenValue * 24 * 60 * 60 * 1000;
    } else if (accessTokenUnit === "h") {
        accessTokenMaxAge = accessTokenValue * 60 * 60 * 1000;
    } else if (accessTokenUnit === "m") {
        accessTokenMaxAge = accessTokenValue * 60 * 1000;
    } else if (accessTokenUnit === "s") {
        accessTokenMaxAge = accessTokenValue * 1000;
    } else {
        accessTokenMaxAge = 1000 * 60 * 60; // default 1 hour
    }

    // convert refreshTokenExpiresIn to milliseconds
    let refreshTokenMaxAge = 0;
    const refreshTokenUnit = refreshTokenExpiresIn.slice(-1);
    const refreshTokenValue = parseInt(refreshTokenExpiresIn.slice(0, -1));
    if (refreshTokenUnit === "y") {
        refreshTokenMaxAge = refreshTokenValue * 365 * 24 * 60 * 60 * 1000;
    }
    else if (refreshTokenUnit === "M") {
        refreshTokenMaxAge = refreshTokenValue * 30 * 24 * 60 * 60 * 1000;
    }
    else if (refreshTokenUnit === "w") {
        refreshTokenMaxAge = refreshTokenValue * 7 * 24 * 60 * 60 * 1000;
    }
    else if (refreshTokenUnit === "d") {
        refreshTokenMaxAge = refreshTokenValue * 24 * 60 * 60 * 1000;
    } else if (refreshTokenUnit === "h") {
        refreshTokenMaxAge = refreshTokenValue * 60 * 60 * 1000;
    } else if (refreshTokenUnit === "m") {
        refreshTokenMaxAge = refreshTokenValue * 60 * 1000;
    } else if (refreshTokenUnit === "s") {
        refreshTokenMaxAge = refreshTokenValue * 1000;
    } else {
        refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 30; // default 30 days
    }
    const result = await AuthServices.loginUser(req.body);
    const { refreshToken, accessToken } = result;
    res.cookie("accessToken", accessToken, {
        secure: config.env === 'production',
        httpOnly: true,
        sameSite: "none",
        maxAge: accessTokenMaxAge,
    });
    res.cookie("refreshToken", refreshToken, {
        secure: config.env === 'production',
        httpOnly: true,
        sameSite: "none",
        maxAge: refreshTokenMaxAge,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logged in successfully!",
        data: {
            needPasswordChange: result.needPasswordChange,
        }
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    /*
    EXPIRES_IN=7d

  REFRESH_TOKEN_EXPIRES_IN=1y
    */
    const accessTokenExpiresIn = config.jwt.expires_in as string;
    const refreshTokenExpiresIn = config.jwt.refresh_token_expires_in as string;

    // convert accessTokenExpiresIn to milliseconds
    let accessTokenMaxAge = 0;
    const accessTokenUnit = accessTokenExpiresIn.slice(-1);
    const accessTokenValue = parseInt(accessTokenExpiresIn.slice(0, -1));
    if (accessTokenUnit === "y") {
        accessTokenMaxAge = accessTokenValue * 365 * 24 * 60 * 60 * 1000;
    }
    else if (accessTokenUnit === "M") {
        accessTokenMaxAge = accessTokenValue * 30 * 24 * 60 * 60 * 1000;
    }
    else if (accessTokenUnit === "w") {
        accessTokenMaxAge = accessTokenValue * 7 * 24 * 60 * 60 * 1000;
    }
    else if (accessTokenUnit === "d") {
        accessTokenMaxAge = accessTokenValue * 24 * 60 * 60 * 1000;
    } else if (accessTokenUnit === "h") {
        accessTokenMaxAge = accessTokenValue * 60 * 60 * 1000;
    } else if (accessTokenUnit === "m") {
        accessTokenMaxAge = accessTokenValue * 60 * 1000;
    } else if (accessTokenUnit === "s") {
        accessTokenMaxAge = accessTokenValue * 1000;
    } else {
        accessTokenMaxAge = 1000 * 60 * 60; // default 1 hour
    }

    // convert refreshTokenExpiresIn to milliseconds
    let refreshTokenMaxAge = 0;
    const refreshTokenUnit = refreshTokenExpiresIn.slice(-1);
    const refreshTokenValue = parseInt(refreshTokenExpiresIn.slice(0, -1));
    if (refreshTokenUnit === "y") {
        refreshTokenMaxAge = refreshTokenValue * 365 * 24 * 60 * 60 * 1000;
    }
    else if (refreshTokenUnit === "M") {
        refreshTokenMaxAge = refreshTokenValue * 30 * 24 * 60 * 60 * 1000;
    }
    else if (refreshTokenUnit === "w") {
        refreshTokenMaxAge = refreshTokenValue * 7 * 24 * 60 * 60 * 1000;
    }
    else if (refreshTokenUnit === "d") {
        refreshTokenMaxAge = refreshTokenValue * 24 * 60 * 60 * 1000;
    } else if (refreshTokenUnit === "h") {
        refreshTokenMaxAge = refreshTokenValue * 60 * 60 * 1000;
    } else if (refreshTokenUnit === "m") {
        refreshTokenMaxAge = refreshTokenValue * 60 * 1000;
    } else if (refreshTokenUnit === "s") {
        refreshTokenMaxAge = refreshTokenValue * 1000;
    } else {
        refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 30; // default 30 days
    }


    const result = await AuthServices.refreshToken(refreshToken);
    res.cookie("accessToken", result.accessToken, {
        secure: config.env === 'production',
        httpOnly: true,
        sameSite: "none",
        maxAge: accessTokenMaxAge,
    });

    res.cookie("refreshToken", result.refreshToken, {
        secure: config.env === 'production',
        httpOnly: true,
        sameSite: "none",
        maxAge: refreshTokenMaxAge,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Access token genereated successfully!",
        data: {
            message: "Access token genereated successfully!",
        },
    });
});

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;

        const result = await AuthServices.changePassword(user, req.body);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Password Changed successfully",
            data: result,
        });
    }
);

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthServices.forgotPassword(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Check your email!",
        data: null,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    // Extract token from Authorization header (remove "Bearer " prefix)
    const authHeader = req.headers.authorization;
    console.log({ authHeader });
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const user = req.user || undefined; // Will be populated if authenticated via middleware

    await AuthServices.resetPassword(token, req.body, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Reset!",
        data: null,
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = req.cookies as { accessToken: string; refreshToken: string };

    const result = await AuthServices.getMe(user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});

export const googleCallbackController = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "No user found")
        }

        // 1️⃣ Handle redirect query
        let redirectTo = req.query.state ? String(req.query.state) : ""
        if (redirectTo.startsWith("/")) {
            redirectTo = redirectTo.slice(1)
        }

        // 2️⃣ Create JWT token manually
        const payload = {
            email: user.email,
            role: user.role,
        }

        const accessToken = jwtHelpers.generateToken(
            payload,
            config.jwt.jwt_secret as Secret,
            config.jwt.expires_in as string
        )

        const refreshToken = jwtHelpers.generateToken(
            payload,
            config.jwt.refresh_token_secret as Secret,
            config.jwt.refresh_token_expires_in as string
        )

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: config.env === "production",
            sameSite: "none",
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.env === "production",
            sameSite: "none",
        })


        // 4️⃣ Redirect to frontend
        res.redirect(`${config.frontend_url}/${redirectTo}`)
    }
)


export const AuthController = {
    createUser,
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    getMe,
    googleCallbackController
};
