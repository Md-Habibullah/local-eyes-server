// import { UserRole } from "@prisma/client";
import * as bcrypt from 'bcryptjs';
import config from "../config";
import { UserRole } from '../generated/prisma/enums';
import { prisma } from '../lib/prisma';
import { tr } from 'zod/v4/locales';
// import prisma from "../shared/prisma";

const seedSuperAdmin = async () => {
    try {
        const isExistSuperAdmin = await prisma.user.findFirst({
            where: {
                role: UserRole.ADMIN,
                admin: {
                    isSuper: true
                }
            }
        });

        if (isExistSuperAdmin) {
            console.log("Super admin already exists!")
            return;
        };

        const hashedPassword = await bcrypt.hash("123456", Number(config.salt_round))

        return await prisma.$transaction(async (tx) => {
            const superAdminData = await tx.user.create({
                data: {
                    email: "super@gmail.com",
                    password: hashedPassword,
                    role: UserRole.ADMIN
                }
            });

            const superAdminProfile = await tx.admin.create({
                data: {
                    userId: superAdminData.id,
                    name: "Super Admin",
                    isSuper: true
                }
            });
            console.log("Super Admin Created Successfully!", { ...superAdminData, ...superAdminProfile });
        });


    }
    catch (err) {
        console.error(err);
    }
    finally {
        await prisma.$disconnect();
    }
};

export default seedSuperAdmin;