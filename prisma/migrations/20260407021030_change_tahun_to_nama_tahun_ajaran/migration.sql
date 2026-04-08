/*
  Warnings:

  - You are about to drop the column `tahun` on the `TahunAjaran` table. All the data in the column will be lost.
  - Added the required column `namaTahunAjaran` to the `TahunAjaran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TahunAjaran" DROP COLUMN "tahun",
ADD COLUMN     "namaTahunAjaran" TEXT NOT NULL;
