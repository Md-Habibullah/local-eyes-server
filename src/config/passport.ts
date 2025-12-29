/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import config from ".";
import { UserRole, UserStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { IPassportUser } from "../app/interfaces/passport.interface";

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.google_client_id || "",
            clientSecret: config.google.google_client_secret || "",
            callbackURL: config.google.google_callback_url,
        },
        async (
            _accessToken: string,
            _refreshToken: string,
            profile: Profile,
            done
        ) => {
            try {
                // 1️⃣ Check auth provider
                const authProvider = await prisma.authProviderModel.findUnique({
                    where: {
                        provider_providerId: {
                            provider: "GOOGLE",
                            providerId: profile.id,
                        },
                    },
                    include: {
                        user: true,
                    },
                });

                if (authProvider) {
                    const user = authProvider.user;

                    if (!user || user.status !== UserStatus.ACTIVE) {
                        return done(null, false);
                    }

                    const passportUser: IPassportUser = {
                        userId: user.id,
                        email: user.email,
                        role: user.role,
                    };

                    return done(null, passportUser);
                }

                // 2️⃣ Email validation
                const email = profile.emails?.[0]?.value;
                if (!email) return done(null, false);

                // 3️⃣ Find or create user
                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    const defaultPassword = await bcrypt.hash(
                        crypto.randomUUID(),
                        Number(config.salt_round)
                    );

                    user = await prisma.$transaction(async (tx) => {
                        const createdUser = await tx.user.create({
                            data: {
                                email,
                                role: UserRole.TOURIST,
                                password: defaultPassword,
                                needPasswordChange: true,
                            },
                        });

                        await tx.authProviderModel.create({
                            data: {
                                provider: "GOOGLE",
                                providerId: profile.id,
                                userId: createdUser.id,
                            },
                        });

                        await tx.tourist.create({
                            data: {
                                userId: createdUser.id,
                                name: profile.displayName,
                                gender: "OTHER",
                                languages: [],
                                preferences: [],
                            },
                        });

                        return createdUser;
                    });
                } else {
                    await prisma.authProviderModel.upsert({
                        where: {
                            provider_providerId: {
                                provider: "GOOGLE",
                                providerId: profile.id,
                            },
                        },
                        update: {},
                        create: {
                            provider: "GOOGLE",
                            providerId: profile.id,
                            userId: user.id,
                        },
                    });
                }

                if (user.status !== UserStatus.ACTIVE) {
                    return done(null, false);
                }

                const passportUser: IPassportUser = {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                };

                return done(null, passportUser);
            } catch (error) {
                console.error("Google strategy error:", error);
                return done(error);
            }
        }
    )
);



passport.serializeUser((user: IPassportUser, done) => {
    done(null, user.userId);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id }, // id is now string
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
            },
        });

        if (!user || user.status !== UserStatus.ACTIVE) {
            return done(null, false);
        }

        const passportUser: IPassportUser = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        done(null, passportUser);
    } catch (error) {
        done(error);
    }
});