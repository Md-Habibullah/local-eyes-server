-- AlterTable
ALTER TABLE "guides" ADD COLUMN     "otpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpLastSentAt" TIMESTAMP(3);
