/*
  Warnings:

  - The values [TidakAktif] on the enum `StatusTahunAjaran` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusTahunAjaran_new" AS ENUM ('Aktif', 'Nonaktif');
ALTER TABLE "TahunAjaran" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TahunAjaran" ALTER COLUMN "status" TYPE "StatusTahunAjaran_new" USING ("status"::text::"StatusTahunAjaran_new");
ALTER TYPE "StatusTahunAjaran" RENAME TO "StatusTahunAjaran_old";
ALTER TYPE "StatusTahunAjaran_new" RENAME TO "StatusTahunAjaran";
DROP TYPE "StatusTahunAjaran_old";
ALTER TABLE "TahunAjaran" ALTER COLUMN "status" SET DEFAULT 'Aktif';
COMMIT;
