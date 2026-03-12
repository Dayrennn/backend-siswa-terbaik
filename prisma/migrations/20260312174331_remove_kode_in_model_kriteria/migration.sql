/*
  Warnings:

  - You are about to drop the column `kode` on the `Kriteria` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Kriteria_kode_key";

-- AlterTable
ALTER TABLE "Kriteria" DROP COLUMN "kode";
