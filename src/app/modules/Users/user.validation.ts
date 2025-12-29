import { z } from 'zod';
import { UserRole, Gender } from '../../../generated/prisma/enums';

const createUser = z.object({
    password: z.string().min(6),
    user: z.object({
        email: z.string().refine((val) => {
            // Basic custom email regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(val);
        }, {
            message: "Please provide a valid email address",
        }),
        role: z.enum([UserRole.TOURIST, UserRole.GUIDE]),

        // common
        name: z.string(),
        gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
        profilePhoto: z.string().optional(),
        bio: z.string().optional(),
        address: z.string().optional(),
        contactNumber: z.string().optional(),
        languages: z.array(z.string()).optional(),

        // tourist specific
        preferences: z.string().optional(),

        // guide specific
        expertise: z.array(z.string()).optional(),
        dailyRate: z.number().optional(),
    }),
});

const updateProfile = z.object({
    name: z.string().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
    profilePhoto: z.string().optional(),
    bio: z.string().optional(),
    address: z.string().optional(),
    contactNumber: z.string().optional(),
    languages: z.array(z.string()).optional(),

    preferences: z.array(z.string()).optional(),
    expertise: z.array(z.string()).optional(),
    dailyRate: z.number().optional(),
});

export const UserValidation = {
    createUser,
    updateProfile,
};
