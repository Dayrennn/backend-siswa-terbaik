import prisma from '../config/prisma.js';

export const addEskul = async ({ namaEskul, deskripsi }) => {
    if (!namaEskul) {
        throw new Error('Nama Eskul Wajib Di Isi');
    }

    const existingEskul = await prisma.eskul.findFirst({
        where: { namaEskul },
    });

    if (existingEskul) {
        throw new Error('Nama Eskul Sudah Ada');
    }

    const newEskul = await prisma.eskul.create({
        data: {
            namaEskul,
            deskripsi,
        },
    });

    // tidak lagi auto-create NilaiEskulRekap untuk semua siswa saat eskul dibuat
    // NilaiEskulRekap dibuat manual saat siswa didaftarkan ke eskul tertentu

    return newEskul;
};

export const getAllEskul = async () => {
    const result = await prisma.eskul.findMany({
        select: {
            id: true,
            namaEskul: true,
            deskripsi: true,
        },
    });

    return result;
};

export const updateEskul = async ({ id, namaEskul, deskripsi }) => {
    const existingEskul = await prisma.eskul.findUnique({
        where: { id },
    });

    if (!existingEskul) {
        throw new Error('Eskul Tidak Ditemukan');
    }

    if (namaEskul) {
        const existing = await prisma.eskul.findFirst({
            where: { namaEskul, NOT: { id } },
        });
        if (existing) {
            throw new Error('Nama sudah ada');
        }
    }

    const data = {};
    if (namaEskul) data.namaEskul = namaEskul;
    if (deskripsi !== undefined) data.deskripsi = deskripsi;

    const updatedEskul = await prisma.eskul.update({
        where: { id },
        data,
        select: {
            id: true,
            namaEskul: true,
            deskripsi: true,
        },
    });

    return updatedEskul;
};

export const deleteEskul = async (id) => {
    const existingEskul = await prisma.eskul.findUnique({ where: { id } });
    if (!existingEskul) throw new Error('Eskul tidak ditemukan');

    // hapus semua rekap eskul sebelum delete
    await prisma.nilaiEskulRekap.deleteMany({ where: { eskulId: id } });

    const remove = await prisma.eskul.delete({ where: { id } });
    return remove;
};
