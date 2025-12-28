/*
  Warnings:

  - The `preferences` column on the `tourists` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tourists" DROP COLUMN "preferences",
ADD COLUMN     "preferences" TEXT[];
