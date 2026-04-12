/*
  Warnings:

  - Added the required column `kodeKelas` to the `Kelas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kelas" ADD COLUMN     "kodeKelas" TEXT NOT NULL;
