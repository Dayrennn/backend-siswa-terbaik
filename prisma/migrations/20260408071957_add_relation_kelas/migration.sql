/*
  Warnings:

  - You are about to drop the column `kelas` on the `Siswa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Siswa" DROP COLUMN "kelas",
ADD COLUMN     "kelasId" TEXT;

-- CreateTable
CREATE TABLE "Kelas" (
    "id" TEXT NOT NULL,
    "namaKelas" TEXT NOT NULL,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
