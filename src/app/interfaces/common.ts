import { UserRole } from "../../generated/prisma/enums";

export interface IAuthUser {
    userId: string;
    email: string;
    role: UserRole;

    tourist?: {
        id: string;
    } | null;

    guide?: {
        id: string;
        isVerified?: boolean;
    } | null;

    admin?: null; // keep for symmetry / future use
}