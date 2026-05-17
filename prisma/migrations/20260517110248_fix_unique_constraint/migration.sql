/*
  Warnings:

  - A unique constraint covering the columns `[siswaId,pertemuanId]` on the table `Kehadiran` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Kehadiran_siswaId_tanggalKehadiran_key";

-- CreateIndex
CREATE UNIQUE INDEX "Kehadiran_siswaId_pertemuanId_key" ON "Kehadiran"("siswaId", "pertemuanId");
