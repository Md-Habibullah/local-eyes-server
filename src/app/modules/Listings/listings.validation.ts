import { z } from 'zod';
import { TourCategory } from '../../../generated/prisma/enums';

export const createTour = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    itinerary: z.string().min(10),
    price: z.number().int().positive(),
    duration: z.number().int().positive(),
    durationType: z.string().optional(),
    meetingPoint: z.string(),
    maxGroupSize: z.number().int().positive(),
    category: z.nativeEnum(TourCategory),
    city: z.string(),
    country: z.string().optional(),
    images: z.array(z.string()).optional(), // matches Prisma model
});

const updateTour = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    itinerary: z.string().optional(),
    price: z.number().int().positive().optional(),
    duration: z.number().int().positive().optional(),
    durationType: z.string().optional(),
    meetingPoint: z.string().optional(),
    maxGroupSize: z.number().int().positive().optional(),
    category: z.nativeEnum(TourCategory).optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
});

export const TourValidation = {
    createTour,
    updateTour,
};
