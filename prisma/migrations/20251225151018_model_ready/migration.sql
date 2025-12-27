/*
  Warnings:

  - The values [REJECTED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `groupSize` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `averageRating` on the `Guide` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Guide` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `Guide` table. All the data in the column will be lost.
  - You are about to drop the column `totalToursCompleted` on the `Guide` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Guide` table. All the data in the column will be lost.
  - The `expertise` column on the `Guide` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `dailyRate` on the `Guide` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `bookingId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `durationHours` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Tour` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Tour` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `createdAt` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Availability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wishlist` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Guide` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Tourist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Guide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Guide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Guide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Made the column `itinerary` on table `Tour` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `email` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TOURIST', 'GUIDE', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_guideId_fkey";

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_tourId_fkey";

-- DropForeignKey
ALTER TABLE "Guide" DROP CONSTRAINT "Guide_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_guideId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_touristId_fkey";

-- DropForeignKey
ALTER TABLE "Tourist" DROP CONSTRAINT "Tourist_userId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_tourId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_touristId_fkey";

-- DropIndex
DROP INDEX "Admin_userId_key";

-- DropIndex
DROP INDEX "Booking_tourId_guideId_touristId_idx";

-- DropIndex
DROP INDEX "Guide_userId_key";

-- DropIndex
DROP INDEX "Review_bookingId_key";

-- DropIndex
DROP INDEX "Tour_city_category_idx";

-- DropIndex
DROP INDEX "Tourist_userId_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "isSuper" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "profilePic" TEXT;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "groupSize",
DROP COLUMN "totalPrice",
DROP COLUMN "updatedAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Guide" DROP COLUMN "averageRating",
DROP COLUMN "createdAt",
DROP COLUMN "totalReviews",
DROP COLUMN "totalToursCompleted",
DROP COLUMN "userId",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "profilePic" TEXT,
DROP COLUMN "expertise",
ADD COLUMN     "expertise" TEXT[],
ALTER COLUMN "dailyRate" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "bookingId";

-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "category",
DROP COLUMN "city",
DROP COLUMN "durationHours",
DROP COLUMN "updatedAt",
ADD COLUMN     "duration" INTEGER NOT NULL,
ALTER COLUMN "itinerary" SET NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Tourist" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "preferences" TEXT,
ADD COLUMN     "profilePic" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
DROP COLUMN "isActive",
DROP COLUMN "name",
DROP COLUMN "profileImage",
DROP COLUMN "verificationStatus",
ADD COLUMN     "needPasswordChange" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropTable
DROP TABLE "Availability";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Wishlist";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "ReportStatus";

-- DropEnum
DROP TYPE "TourCategory";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "VerificationStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_email_key" ON "Guide"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_email_key" ON "Tourist"("email");

-- AddForeignKey
ALTER TABLE "Tourist" ADD CONSTRAINT "Tourist_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
