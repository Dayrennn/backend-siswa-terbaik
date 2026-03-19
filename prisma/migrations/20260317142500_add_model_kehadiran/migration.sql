-- CreateEnum
CREATE TYPE "StatusKehadiran" AS ENUM ('Hadir', 'Izin', 'Sakit', 'Alpha');

-- CreateTable
CREATE TABLE "Kehadiran" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "statusKehadiran" "StatusKehadiran" NOT NULL,
    "tanggalKehadiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kehadiran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kehadiran_siswaId_tanggalKehadiran_key" ON "Kehadiran"("siswaId", "tanggalKehadiran");

-- AddForeignKey
ALTER TABLE "Kehadiran" ADD CONSTRAINT "Kehadiran_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
