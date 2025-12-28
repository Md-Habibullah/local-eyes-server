/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import config from ".";
import { UserRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import * as bcrypt from 'bcryptjs';

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.google_client_id || "",
            clientSecret: config.google.google_client_secret || "",
            callbackURL: config.google.google_callback_url,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 🔥 1. CHECK GOOGLE PROVIDER FIRST
                const auth = await prisma.authProviderModel.findUnique({
                    where: {
                        provider_providerId: {
                            provider: "GOOGLE",
                            providerId: profile.id,
                        },
                    },
                })

                if (auth) {
                    const user = await prisma.user.findUnique({
                        where: { id: auth.userId },
                    })
                    if (!user) return done(null, false)
                    return done(null, user)
                }

                // 🔥 2. THEN CHECK EMAIL
                const email = profile.emails?.[0]?.value
                if (!email) {
                    return done(null, false, { message: "no email found" })
                }

                // 🔥 3. CHECK USER BY EMAIL
                let user = await prisma.user.findFirst({ where: { email } })

                if (!user) {
                    const defaultPassword = await bcrypt.hash(
                        "default",
                        Number(config.salt_round)
                    )

                    user = await prisma.$transaction(async (tx) => {
                        const createdUser = await tx.user.create({
                            data: {
                                email,
                                role: UserRole.TOURIST,
                                password: defaultPassword,
                                needPasswordChange: true,
                            },
                        })

                        await tx.authProviderModel.create({
                            data: {
                                provider: "GOOGLE",
                                providerId: profile.id,
                                userId: createdUser.id,
                            },
                        })

                        await tx.tourist.create({
                            data: {
                                userId: createdUser.id,
                                name: profile.displayName,
                                gender: "OTHER",
                                languages: [],
                                preferences: [],
                            },
                        })

                        return createdUser
                    })
                } else {
                    // 🔥 4. EXISTING USER → LINK GOOGLE ACCOUNT
                    await prisma.authProviderModel.create({
                        data: {
                            provider: "GOOGLE",
                            providerId: profile.id,
                            userId: user.id,
                        },
                    })
                }

                return done(null, user)
            } catch (error) {
                console.error("google strategy error", error)
                return done(error)
            }
        }
    )
)



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