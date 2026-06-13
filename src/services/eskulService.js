import prisma from '../config/prisma.js';

export const addEskul = async ({ namaEskul }) => {
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
            namaEskul: namaEskul,
        },
    });

    return newEskul;
};

export const getAllEskul = async () => {
    const result = await prisma.eskul.findMany({
        select: {
            id: true,
            namaEskul: true,
        },
    });

    return result;
};

export const updateEskul = async ({ id, namaEskul }) => {
    const existingEskul = await prisma.eskul.findUnique({
        where: { id },
    });

    if (!existingEskul) {
        throw new Error('Eskul Tidak Ditemukan');
    }

    if (namaEskul) {
        const existing = await prisma.eskul.findFirst({
            where: { namaEskul },
        });
        if (existing) {
            throw new Error('Nama sudah ada');
        }
    }

    const data = {};
    if (namaEskul) data.namaEskul = namaEskul;

    const updateEskul = await prisma.eskul.update({
        where: { id },
        data,
        select: {
            id: true,
            namaEskul: true,
        },
    });

    return updateEskul;
};

export const deleteEskul = async (id) => {
    const existingEskul = await prisma.eskul.findUnique({ where: { id } });
    if (!existingEskul) throw new Error('Eskul tidak ditemukan');

    await prisma.jadwalEskul.deleteMany({ where: { eskulId: id } });

    await prisma.absensiEskul.deleteMany({
        where: { pertemuanEskul: { eskulId: id } },
    });
    await prisma.pertemuanEskul.deleteMany({ where: { eskulId: id } });

    await prisma.absensiEskul.deleteMany({
        where: { siswaEskul: { eskulId: id } },
    });
    await prisma.siswaEskul.deleteMany({ where: { eskulId: id } });

    const remove = await prisma.eskul.delete({ where: { id } });
    return remove;
};
