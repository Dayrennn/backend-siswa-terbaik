import prisma from '../config/prisma.js';

export const inputNilaiEskul = async ({ eskulId, nilaiSiswa, tahunAjaranId }) => {
    const existingEskul = await prisma.eskul.findUnique({
        where: { id: eskulId },
    });
    if (!existingEskul) throw new Error('Eskul tidak ditemukan');

    const existingTahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id: tahunAjaranId },
    });
    if (!existingTahunAjaran) throw new Error('Tahun ajaran tidak ditemukan');

    // ambil semua siswa yang akan diupdate untuk dapatkan kelasId
    const siswaIds = nilaiSiswa.map((n) => n.siswaId);
    const siswaList = await prisma.siswa.findMany({
        where: { id: { in: siswaIds } },
        select: { id: true, kelasId: true },
    });
    const kelasMap = Object.fromEntries(siswaList.map((s) => [s.id, s.kelasId]));

    const results = await Promise.all(
        nilaiSiswa.map(async ({ siswaId, nilai }) => {
            const kelasId = kelasMap[siswaId];
            if (!kelasId) throw new Error(`Siswa ${siswaId} belum memiliki kelas, tidak dapat input nilai eskul`);

            const res = await prisma.nilaiEskulRekap.upsert({
                where: {
                    siswaId_eskulId_tahunAjaranId: {
                        siswaId,
                        eskulId,
                        tahunAjaranId,
                    },
                },
                create: {
                    siswaId,
                    eskulId,
                    tahunAjaranId,
                    kelasId,
                    nilaiAkhir: nilai,
                },
                update: { nilaiAkhir: nilai },
                select: {
                    id: true,
                    nilaiAkhir: true,
                    siswa: { select: { id: true, namaSiswa: true, nis: true } },
                    eskul: { select: { id: true, namaEskul: true } },
                },
            });
            return res;
        }),
    );

    return results;
};
