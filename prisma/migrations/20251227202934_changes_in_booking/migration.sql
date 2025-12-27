-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "guidePayoutAmount" INTEGER,
ADD COLUMN     "isGuidePaid" BOOLEAN NOT NULL DEFAULT false;
