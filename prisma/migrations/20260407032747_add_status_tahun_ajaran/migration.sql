-- CreateEnum
CREATE TYPE "StatusTahunAjaran" AS ENUM ('Aktif', 'TidakAktif');

-- AlterTable
ALTER TABLE "TahunAjaran" ADD COLUMN     "status" "StatusTahunAjaran" NOT NULL DEFAULT 'Aktif';
