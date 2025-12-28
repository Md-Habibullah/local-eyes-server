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
            callbackURL: config.google.google_callback_url
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value
                if (!email) {
                    return done(null, false, { message: 'no email found' })
                }

                let user = await prisma.user.findFirst({ where: { email } })
                let tourist = {};
                let data = { ...user, ...tourist };
                const defaultPassword = await bcrypt.hashSync("default", config.salt_round)

                if (!user) {
                    await prisma.$transaction(async (tx) => {
                        const user = await tx.user.create({
                            data: {
                                email,
                                role: UserRole.TOURIST,
                                password: defaultPassword,
                                needPasswordChange: true,
                            },
                        })

                        await tx.authProviderModel.create({
                            data: {
                                provider: 'GOOGLE',
                                providerId: profile.id,
                                userId: user.id,
                            },
                        })

                        tourist = await tx.tourist.create({
                            data: {
                                userId: user.id,
                                name: profile.displayName,
                                gender: 'MALE',
                                languages: [],
                                preferences: [],
                            },
                        })
                    })
                }
                return done(null, data)

            } catch (error) {
                // eslint-disable-next-line no-console
                console.log('google stratigy error', error)
                return done(error)
            }
        }
    )
)

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } })
        done(null, user)
    } catch (error) {
        done(error)
    }
})