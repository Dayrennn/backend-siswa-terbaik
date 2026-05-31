-- CreateEnum
CREATE TYPE "JenisNilai" AS ENUM ('Tugas', 'UlanganHarian', 'UTS', 'UAS');

-- CreateTable
CREATE TABLE "NilaiAkademik" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "pelajaranId" TEXT NOT NULL,
    "tahunAjaranId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "jenis" "JenisNilai" NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,

    CONSTRAINT "NilaiAkademik_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NilaiAkademik" ADD CONSTRAINT "NilaiAkademik_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAkademik" ADD CONSTRAINT "NilaiAkademik_pelajaranId_fkey" FOREIGN KEY ("pelajaranId") REFERENCES "Pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAkademik" ADD CONSTRAINT "NilaiAkademik_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAkademik" ADD CONSTRAINT "NilaiAkademik_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
