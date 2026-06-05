-- CreateEnum
CREATE TYPE "Hari" AS ENUM ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu');

-- CreateTable
CREATE TABLE "Jadwal" (
    "id" TEXT NOT NULL,
    "pelajaranId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "hari" "Hari" NOT NULL,
    "jamMulai" INTEGER NOT NULL,
    "jamSelesai" INTEGER NOT NULL,

    CONSTRAINT "Jadwal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_pelajaranId_fkey" FOREIGN KEY ("pelajaranId") REFERENCES "Pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
