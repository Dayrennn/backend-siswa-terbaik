/*
  Warnings:

  - You are about to drop the column `tahunAjaran` on the `Kehadiran` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Kehadiran" DROP COLUMN "tahunAjaran",
ADD COLUMN     "tahunAjaranId" TEXT;

-- AlterTable
ALTER TABLE "Siswa" ADD COLUMN     "tahunAjaranId" TEXT;

-- CreateTable
CREATE TABLE "TahunAjaran" (
    "id" TEXT NOT NULL,
    "tahun" TEXT NOT NULL,

    CONSTRAINT "TahunAjaran_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kehadiran" ADD CONSTRAINT "Kehadiran_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;
