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
                const defaultPassword = await bcrypt.hashSync("default", config.salt_round)
                if (!user) {
                    // user = await User.create({
                    //     email,
                    //     name: profile.displayName,
                    //     profilePhoto: profile.photos?.[0].value,
                    //     role: UserRole.TOURIST,
                    //     isVerified: true,
                    //     auths: [{
                    //         provider: 'google',
                    //         providerId: profile.id
                    //     }]
                    // })

                    user = await prisma.user.create({
                        data: {
                            email,
                            role: UserRole.TOURIST,
                            password: defaultPassword,
                            isVerified: true,
                            auths: [{
                                provider: 'google',
                                providerId: profile.id
                            }]
                        }
                    })

                    const tourist = await prisma.tourist.create({
                        data: {
                            name: profile.displayName,
                            profilePhoto: profile.photos?.[0].value,
                        }
                    })

                }
                return done(null, user)

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
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        done(error)
    }
})