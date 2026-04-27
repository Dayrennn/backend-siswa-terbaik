/*
  Warnings:

  - You are about to drop the column `tahunAjaranId` on the `Kehadiran` table. All the data in the column will be lost.
  - You are about to drop the column `kelasId` on the `Pertemuan` table. All the data in the column will be lost.
  - You are about to drop the column `tahunAjaranId` on the `Pertemuan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Kehadiran" DROP CONSTRAINT "Kehadiran_tahunAjaranId_fkey";

-- DropForeignKey
ALTER TABLE "Pertemuan" DROP CONSTRAINT "Pertemuan_kelasId_fkey";

-- DropForeignKey
ALTER TABLE "Pertemuan" DROP CONSTRAINT "Pertemuan_tahunAjaranId_fkey";

-- AlterTable
ALTER TABLE "Kehadiran" DROP COLUMN "tahunAjaranId";

-- AlterTable
ALTER TABLE "Pertemuan" DROP COLUMN "kelasId",
DROP COLUMN "tahunAjaranId";
