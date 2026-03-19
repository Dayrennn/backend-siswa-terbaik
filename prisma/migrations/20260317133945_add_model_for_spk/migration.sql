-- CreateTable
CREATE TABLE "Hafalan" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "jumlahJuz" INTEGER NOT NULL,

    CONSTRAINT "Hafalan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoinPlus" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "poin" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoinPlus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoinMinus" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "poin" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoinMinus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eskul" (
    "id" TEXT NOT NULL,
    "namaEskul" TEXT NOT NULL,

    CONSTRAINT "Eskul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiswaEskul" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "eskulId" TEXT NOT NULL,

    CONSTRAINT "SiswaEskul_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hafalan_siswaId_key" ON "Hafalan"("siswaId");

-- AddForeignKey
ALTER TABLE "Hafalan" ADD CONSTRAINT "Hafalan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoinPlus" ADD CONSTRAINT "PoinPlus_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoinMinus" ADD CONSTRAINT "PoinMinus_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiswaEskul" ADD CONSTRAINT "SiswaEskul_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiswaEskul" ADD CONSTRAINT "SiswaEskul_eskulId_fkey" FOREIGN KEY ("eskulId") REFERENCES "Eskul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
