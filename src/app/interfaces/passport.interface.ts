import { UserRole } from "../../generated/prisma/enums";


export interface IPassportUser {
    userId: string;
    email: string;
    role: UserRole;
}