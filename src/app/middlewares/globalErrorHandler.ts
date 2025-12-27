/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import config from "../../config";
import ApiError from "../errors/apiError";
import { TErrorSources } from "../interfaces/errorTypes";
import { handleZodError } from "../errors/handleZodError";
import { handlePrismaError } from "../errors/handlePrismaError";

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) => {
    if (config.env === "development") {
        console.error("🔥 Global Error:", err);
    }

    // ✅ DEFAULTS (IMPORTANT)
    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong";
    let errorSources: TErrorSources[] = [];

    /**
     * ----------------
     * ZOD ERROR
     * ----------------
     */
    if (err?.name === "ZodError") {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    }

    /**
     * ----------------
     * PRISMA VALIDATION ERROR
     * ----------------
     */
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Invalid input data";
        errorSources = [
            {
                path: "",
                message: err.message,
            },
        ];
    }

    /**
     * ----------------
     * PRISMA KNOWN REQUEST ERROR
     * ----------------
     */
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = handlePrismaError(err);
        statusCode = prismaError.statusCode;
        message = prismaError.message;
        errorSources = prismaError.errorSources || [];
    }

    /**
     * ----------------
     * API ERROR
     * ----------------
     */
    else if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message || message;
    }

    /**
     * ----------------
     * GENERIC ERROR
     * ----------------
     */
    else if (err instanceof Error) {
        message = err.message;
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        stack: config.env === "development" ? err.stack : null,
    });
};

export default globalErrorHandler;
