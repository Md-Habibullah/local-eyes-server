import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import ApiError from "../errors/apiError";
import { prisma } from "../../lib/prisma";
import { JwtPayload } from "../interfaces/jwt.interface";
import { UserRole, UserStatus } from "../../generated/prisma/enums";

const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token: string | undefined;

            // 1️⃣ Header first, then cookie
            if (req.headers.authorization?.startsWith("Bearer ")) {
                token = req.headers.authorization.split(" ")[1];
            } else if (req.cookies?.accessToken) {
                token = req.cookies.accessToken;
            }
            console.log("cookies:", req.cookies);
            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }

            if (typeof token === "string" && token.startsWith("Bearer ")) {
                token = token.split(" ")[1];
            }

            // 2️⃣ Verify token
            const verifiedUser = jwtHelpers.verifyToken(
                token,
                config.jwt.jwt_secret as Secret
            ) as JwtPayload;

            // 4️⃣ Optional DB check (recommended)
            const user = await prisma.user.findUnique({
                where: {
                    id: verifiedUser.userId,
                    status: UserStatus.ACTIVE
                },
                select: { status: true },
            });

            if (!user || user.status !== UserStatus.ACTIVE) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "User not authorized");
            }

            // 5️⃣ Role check
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
            }

            req.user = verifiedUser;
            next();
        } catch (err) {
            next(err);
        }
    };
};

export default auth;
