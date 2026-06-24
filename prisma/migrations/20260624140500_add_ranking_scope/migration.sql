-- Support two SMART comparison scopes:
-- ANGKATAN = all students in one school year
-- KELAS = students compared only inside their class

CREATE TYPE "RankingScope" AS ENUM ('KELAS', 'ANGKATAN');

ALTER TABLE "NilaiKriteria"
ADD COLUMN "kelasId" TEXT,
ADD COLUMN "scope" "RankingScope" NOT NULL DEFAULT 'ANGKATAN';

UPDATE "NilaiKriteria" nk
SET "kelasId" = s."kelasId"
FROM "Siswa" s
WHERE nk."siswaId" = s."id";

DROP INDEX IF EXISTS "NilaiKriteria_siswaId_kriteriaId_tahunAjaranId_key";
CREATE UNIQUE INDEX "NilaiKriteria_siswaId_kriteriaId_tahunAjaranId_scope_key"
ON "NilaiKriteria"("siswaId", "kriteriaId", "tahunAjaranId", "scope");

ALTER TABLE "NilaiKriteria"
ADD CONSTRAINT "NilaiKriteria_kelasId_fkey"
FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Ranking"
ADD COLUMN "kelasId" TEXT,
ADD COLUMN "scope" "RankingScope" NOT NULL DEFAULT 'ANGKATAN';

UPDATE "Ranking" r
SET "kelasId" = s."kelasId"
FROM "Siswa" s
WHERE r."siswaId" = s."id";

DROP INDEX IF EXISTS "Ranking_siswaId_tahunAjaranId_key";
CREATE UNIQUE INDEX "Ranking_siswaId_tahunAjaranId_scope_key"
ON "Ranking"("siswaId", "tahunAjaranId", "scope");

ALTER TABLE "Ranking"
ADD CONSTRAINT "Ranking_kelasId_fkey"
FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
