-- CreateTable
CREATE TABLE "_PelajaranToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PelajaranToUser_AB_unique" ON "_PelajaranToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PelajaranToUser_B_index" ON "_PelajaranToUser"("B");

-- AddForeignKey
ALTER TABLE "_PelajaranToUser" ADD CONSTRAINT "_PelajaranToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Pelajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PelajaranToUser" ADD CONSTRAINT "_PelajaranToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
