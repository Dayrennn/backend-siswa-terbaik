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

    const results = await Promise.all(
        nilaiSiswa.map(({ siswaId, nilai }) =>
            prisma.nilaiEskul.update({
                where: {
                    siswaId_eskulId_tahunAjaranId: {
                        siswaId,
                        eskulId,
                        tahunAjaranId,
                    },
                },
                data: { nilai },
                select: {
                    id: true,
                    nilai: true,
                    siswa: {
                        select: {
                            id: true,
                            namaSiswa: true,
                            nis: true,
                        },
                    },
                    eskul: {
                        select: {
                            id: true,
                            namaEskul: true,
                        },
                    },
                },
            }),
        ),
    );

    return results;
};
