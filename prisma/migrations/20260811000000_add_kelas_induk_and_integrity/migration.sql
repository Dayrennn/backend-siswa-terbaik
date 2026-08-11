CREATE TABLE "KelasInduk" (
    "id" TEXT NOT NULL,
    "namaKelasInduk" TEXT NOT NULL,
    CONSTRAINT "KelasInduk_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Kelas" ADD COLUMN "kelasIndukId" TEXT;
ALTER TABLE "NilaiKriteria" ADD COLUMN "kelasIndukId" TEXT;
ALTER TABLE "Ranking" ADD COLUMN "kelasIndukId" TEXT;

CREATE UNIQUE INDEX "KelasInduk_namaKelasInduk_key" ON "KelasInduk"("namaKelasInduk");
CREATE UNIQUE INDEX "TahunAjaran_namaTahunAjaran_key" ON "TahunAjaran"("namaTahunAjaran");
CREATE UNIQUE INDEX "TahunAjaran_single_aktif" ON "TahunAjaran"("status") WHERE "status" = 'Aktif';

ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_kelasIndukId_fkey"
    FOREIGN KEY ("kelasIndukId") REFERENCES "KelasInduk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NilaiKriteria" ADD CONSTRAINT "NilaiKriteria_kelasIndukId_fkey"
    FOREIGN KEY ("kelasIndukId") REFERENCES "KelasInduk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_kelasIndukId_fkey"
    FOREIGN KEY ("kelasIndukId") REFERENCES "KelasInduk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
