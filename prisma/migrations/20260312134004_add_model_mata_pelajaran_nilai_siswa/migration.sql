-- CreateTable
CREATE TABLE "Siswa" (
    "id" TEXT NOT NULL,
    "nis" TEXT,
    "name" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "kelas" TEXT,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataPelajaran" (
    "id" TEXT NOT NULL,
    "namaPelajaran" TEXT NOT NULL,

    CONSTRAINT "MataPelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nilai" (
    "id" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "siswaId" TEXT NOT NULL,
    "mataPelajaranId" TEXT NOT NULL,

    CONSTRAINT "Nilai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_id_key" ON "Siswa"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MataPelajaran_id_key" ON "MataPelajaran"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Nilai_id_key" ON "Nilai"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Nilai_siswaId_mataPelajaranId_key" ON "Nilai"("siswaId", "mataPelajaranId");

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "MataPelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
