/*
  Warnings:

  - Changed the type of `jenis` on the `Kriteria` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Kriteria" DROP COLUMN "jenis",
ADD COLUMN     "jenis" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Jenis";
