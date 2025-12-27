import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { TErrorSources } from "../interfaces/errorTypes";

type TPrismaErrorResponse = {
    statusCode: number;
    message: string;
    errorSources?: TErrorSources[];
};

export const handlePrismaError = (
    err: Prisma.PrismaClientKnownRequestError
): TPrismaErrorResponse => {
    let statusCode: number = httpStatus.BAD_REQUEST;
    let message = "Database error";
    let errorSources: TErrorSources[] = [];

    switch (err.code) {
        /**
         * UNIQUE constraint failed
         */
        case "P2002":
            statusCode = httpStatus.CONFLICT; // 409
            message = "Duplicate value";
            errorSources = [
                {
                    path: (err.meta?.target as string[])?.join(", ") || "",
                    message: "Already exists",
                },
            ];
            break;

        /**
         * FOREIGN KEY constraint failed
         */
        case "P2003":
            statusCode = httpStatus.BAD_REQUEST; // 400
            message = "Invalid reference";
            errorSources = [
                {
                    path: (err.meta?.field_name as string) || "",
                    message: "Referenced record does not exist",
                },
            ];
            break;

        /**
         * RECORD NOT FOUND (update/delete/find)
         */
        case "P2025":
            statusCode = httpStatus.NOT_FOUND; // 404
            message = "Record not found";
            break;

        /**
         * VALUE TOO LONG FOR COLUMN
         */
        case "P2000":
            statusCode = httpStatus.BAD_REQUEST;
            message = "Input value is too long";
            break;

        /**
         * INVALID ENUM VALUE
         */
        case "P2004":
            statusCode = httpStatus.BAD_REQUEST;
            message = "Invalid enum value";
            break;

        /**
         * NULL constraint violation
         */
        case "P2011":
            statusCode = httpStatus.BAD_REQUEST;
            message = "Required field is missing";
            break;

        /**
         * REQUIRED RELATION VIOLATION
         */
        case "P2014":
            statusCode = httpStatus.BAD_REQUEST;
            message = "Relation constraint violation";
            break;

        /**
         * INVALID FOREIGN KEY DATA
         */
        case "P2016":
            statusCode = httpStatus.BAD_REQUEST;
            message = "Invalid related data";
            break;

        /**
         * DATABASE CONNECTION ERROR
         */
        case "P1001":
        case "P1002":
            statusCode = httpStatus.SERVICE_UNAVAILABLE; // 503
            message = "Database connection failed";
            break;

        /**
         * AUTHENTICATION FAILED (DB USER/PASS)
         */
        case "P1000":
            statusCode = httpStatus.INTERNAL_SERVER_ERROR;
            message = "Database authentication failed";
            break;

        /**
         * TRANSACTION FAILED / DEADLOCK
         */
        case "P2034":
            statusCode = httpStatus.CONFLICT;
            message = "Transaction failed, please retry";
            break;

        /**
         * DEFAULT FALLBACK
         */
        default:
            statusCode = httpStatus.BAD_REQUEST;
            message = "Database request error";
            break;
    }

    return {
        statusCode,
        message,
        errorSources,
    };
};
