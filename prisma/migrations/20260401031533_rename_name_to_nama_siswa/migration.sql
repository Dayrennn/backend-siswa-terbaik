/*
  Warnings:

  - You are about to drop the column `name` on the `Siswa` table. All the data in the column will be lost.
  - Added the required column `namaSiswa` to the `Siswa` table without a default value. This is not possible if the table is not empty.

*/
-- Rename column name -> namaSiswa dengan RENAME COLUMN
ALTER TABLE "Siswa" RENAME COLUMN "name" TO "namaSiswa";
