/*
  Warnings:

  - Added the required column `kelasId` to the `Kehadiran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kehadiran" ADD COLUMN     "kelasId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Kehadiran" ADD CONSTRAINT "Kehadiran_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
