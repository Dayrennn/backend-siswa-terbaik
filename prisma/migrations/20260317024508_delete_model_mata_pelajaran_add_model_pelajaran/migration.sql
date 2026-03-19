/*
  Warnings:

  - You are about to drop the column `mataPelajaranId` on the `Nilai` table. All the data in the column will be lost.
  - You are about to drop the `MataPelajaran` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[siswaId,PelajaranId]` on the table `Nilai` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `PelajaranId` to the `Nilai` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Nilai" DROP CONSTRAINT "Nilai_mataPelajaranId_fkey";

-- DropIndex
DROP INDEX "Nilai_siswaId_mataPelajaranId_key";

-- AlterTable
ALTER TABLE "Nilai" DROP COLUMN "mataPelajaranId",
ADD COLUMN     "PelajaranId" TEXT NOT NULL;

-- DropTable
DROP TABLE "MataPelajaran";

-- CreateIndex
CREATE UNIQUE INDEX "Nilai_siswaId_PelajaranId_key" ON "Nilai"("siswaId", "PelajaranId");

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_PelajaranId_fkey" FOREIGN KEY ("PelajaranId") REFERENCES "Pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
