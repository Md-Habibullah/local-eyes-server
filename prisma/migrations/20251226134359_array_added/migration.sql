/*
  Warnings:

  - Added the required column `totalAmount` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `tours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `tours` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TourCategory" AS ENUM ('FOOD', 'ART', 'ADVENTURE', 'HISTORY', 'NATURE', 'SHOPPING', 'PHOTOGRAPHY', 'NIGHTLIFE', 'CULTURE', 'SPORTS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "numberOfPeople" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalAmount" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "category" "TourCategory" NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "durationType" TEXT DEFAULT 'hours',
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_touristId_tourId_key" ON "wishlists"("touristId", "tourId");

-- CreateIndex
CREATE INDEX "bookings_touristId_idx" ON "bookings"("touristId");

-- CreateIndex
CREATE INDEX "bookings_guideId_idx" ON "bookings"("guideId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_date_idx" ON "bookings"("date");

-- CreateIndex
CREATE INDEX "tours_city_idx" ON "tours"("city");

-- CreateIndex
CREATE INDEX "tours_category_idx" ON "tours"("category");

-- CreateIndex
CREATE INDEX "tours_guideId_idx" ON "tours"("guideId");

-- CreateIndex
CREATE INDEX "tours_isActive_idx" ON "tours"("isActive");

-- CreateIndex
CREATE INDEX "tours_price_idx" ON "tours"("price");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "tourists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
