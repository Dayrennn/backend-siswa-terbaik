/*
  Warnings:

  - You are about to drop the column `telphone` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "telphone",
ADD COLUMN     "telephone" TEXT;
