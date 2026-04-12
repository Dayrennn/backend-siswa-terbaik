/*
  Warnings:

  - Added the required column `pertemuanId` to the `Kehadiran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kehadiran" ADD COLUMN     "pertemuanId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Pertemuan" (
    "id" TEXT NOT NULL,
    "tahunAjaranId" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "kelasId" TEXT NOT NULL,
    "namaPertemuan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pertemuan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Kehadiran" ADD CONSTRAINT "Kehadiran_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pertemuan" ADD CONSTRAINT "Pertemuan_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pertemuan" ADD CONSTRAINT "Pertemuan_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
