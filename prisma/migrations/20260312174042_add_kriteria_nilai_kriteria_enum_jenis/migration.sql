-- CreateEnum
CREATE TYPE "Jenis" AS ENUM ('benefit', 'cost');

-- CreateTable
CREATE TABLE "Kriteria" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "namaKriteria" TEXT NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "jenis" "Jenis" NOT NULL,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NilaiKriteria" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NilaiKriteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kriteria_kode_key" ON "Kriteria"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "NilaiKriteria_siswaId_kriteriaId_key" ON "NilaiKriteria"("siswaId", "kriteriaId");

-- AddForeignKey
ALTER TABLE "NilaiKriteria" ADD CONSTRAINT "NilaiKriteria_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiKriteria" ADD CONSTRAINT "NilaiKriteria_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
