-- AlterTable
ALTER TABLE "Kelas" ADD COLUMN     "tahunAjaranId" TEXT;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;
