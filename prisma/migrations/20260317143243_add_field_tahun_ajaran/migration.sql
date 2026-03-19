/*
  Warnings:

  - Added the required column `tahunAjaran` to the `Kehadiran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kehadiran" ADD COLUMN     "tahunAjaran" TEXT NOT NULL;
