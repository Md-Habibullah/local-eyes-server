/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from ".";
import { UserRole, UserStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.google_client_id || "",
            clientSecret: config.google.google_client_secret || "",
            callbackURL: config.google.google_callback_url,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                // 1️⃣ check provider
                const auth = await prisma.authProviderModel.findUnique({
                    where: {
                        provider_providerId: {
                            provider: "GOOGLE",
                            providerId: profile.id,
                        },
                    },
                });

                if (auth) {
                    const user = await prisma.user.findUnique({
                        where: { id: auth.userId },
                    });
                    if (!user || user.status !== UserStatus.ACTIVE)
                        return done(null, false);
                    return done(null, user);
                }

                // 2️⃣ email
                const email = profile.emails?.[0]?.value;
                if (!email) return done(null, false);

                // 3️⃣ find user
                let user = await prisma.user.findFirst({ where: { email } });

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

                        await tx.authProviderModel.upsert({
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

                if (user.status !== UserStatus.ACTIVE)
                    return done(null, false);

                return done(null, user);
            } catch (error) {
                console.error("google strategy error", error);
                return done(error);
            }
        }
    )
);



passport.serializeUser((user: any, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } })
        done(null, user)
    } catch (error) {
        done(error)
    }
})