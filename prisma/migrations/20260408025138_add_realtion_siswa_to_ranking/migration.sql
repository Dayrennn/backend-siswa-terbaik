/*
  Warnings:

  - Added the required column `tahunAjaranId` to the `Nilai` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nilai" ADD COLUMN     "tahunAjaranId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL,
    "tahunAjaranId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "nilaiAkhir" DOUBLE PRECISION NOT NULL,
    "peringkat" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_siswaId_tahunAjaranId_key" ON "Ranking"("siswaId", "tahunAjaranId");

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
