-- CreateTable
CREATE TABLE "_PelajaranToSiswa" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PelajaranToSiswa_AB_unique" ON "_PelajaranToSiswa"("A", "B");

-- CreateIndex
CREATE INDEX "_PelajaranToSiswa_B_index" ON "_PelajaranToSiswa"("B");

-- AddForeignKey
ALTER TABLE "_PelajaranToSiswa" ADD CONSTRAINT "_PelajaranToSiswa_A_fkey" FOREIGN KEY ("A") REFERENCES "Pelajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PelajaranToSiswa" ADD CONSTRAINT "_PelajaranToSiswa_B_fkey" FOREIGN KEY ("B") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
