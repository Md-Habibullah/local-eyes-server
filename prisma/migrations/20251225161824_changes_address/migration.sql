/*
  Warnings:

  - You are about to drop the column `profilePic` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `profilePic` on the `Guide` table. All the data in the column will be lost.
  - You are about to drop the column `profilePic` on the `Tourist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "profilePic",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "profilePhoto" TEXT;

-- AlterTable
ALTER TABLE "Guide" DROP COLUMN "profilePic",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "profilePhoto" TEXT;

-- AlterTable
ALTER TABLE "Tourist" DROP COLUMN "profilePic",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "profilePhoto" TEXT;
