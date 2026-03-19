/*
  Warnings:

  - You are about to drop the column `PelajaranId` on the `Nilai` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[siswaId,pelajaranId]` on the table `Nilai` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pelajaranId` to the `Nilai` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Nilai" DROP CONSTRAINT "Nilai_PelajaranId_fkey";

-- DropIndex
DROP INDEX "Nilai_siswaId_PelajaranId_key";

-- AlterTable
ALTER TABLE "Nilai" DROP COLUMN "PelajaranId",
ADD COLUMN     "pelajaranId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Nilai_siswaId_pelajaranId_key" ON "Nilai"("siswaId", "pelajaranId");

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_pelajaranId_fkey" FOREIGN KEY ("pelajaranId") REFERENCES "Pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
