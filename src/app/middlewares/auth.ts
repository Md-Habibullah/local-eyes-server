import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import ApiError from "../errors/apiError";
import { prisma } from "../../lib/prisma";


const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            let token = req.headers.authorization || req.cookies.accessToken;

            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }

            // handle Bearer token
            if (token.startsWith("Bearer ")) {
                token = token.split(" ")[1];
            }

            const verifiedUser = jwtHelpers.verifyToken(
                token,
                config.jwt.jwt_secret as Secret
            );

            let profile = null;

            if (verifiedUser.role === "TOURIST") {
                profile = await prisma.tourist.findUnique({
                    where: { userId: verifiedUser.userId },
                    select: { id: true }
                });
            }

            if (verifiedUser.role === "GUIDE") {
                profile = await prisma.guide.findUnique({
                    where: { userId: verifiedUser.userId },
                    select: { id: true, isVerified: true }
                });
            }

            if (verifiedUser.role === "ADMIN") {
                profile = await prisma.admin.findUnique({
                    where: { userId: verifiedUser.userId },
                    select: { id: true }
                });
            }

            req.user = {
                ...verifiedUser,
                tourist: verifiedUser.role === "TOURIST" ? profile : null,
                guide: verifiedUser.role === "GUIDE" ? profile : null,
                admin: verifiedUser.role === "ADMIN" ? profile : null,
            };

            req.user = verifiedUser;

            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};


export default auth;