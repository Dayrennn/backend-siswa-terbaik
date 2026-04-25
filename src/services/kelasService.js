import prisma from '../config/prisma.js';

export const addKelas = async ({ kodeKelas, namaKelas }) => {
    if (!kodeKelas?.trim()) {
        throw new Error('Nama kelas wajib di isi');
    }
    if (!namaKelas?.trim()) {
        throw new Error('Nama kelas wajib di isi');
    }

    const existingKelas = await prisma.kelas.findFirst({
        where: {
            kodeKelas,
        },
    });

    if (existingKelas) throw new Error('Data sudah ada');

    const newKelas = await prisma.kelas.create({
        data: {
            kodeKelas: kodeKelas,
            namaKelas: namaKelas,
        },
    });

    return newKelas;
};

export const updateKelas = async (id, { kodeKelas, namaKelas }) => {
    const existingKelas = await prisma.kelas.findUnique({
        where: { id },
    });

    if (!existingKelas) throw new Error('Kelas tidak ditemukan');

    if (namaKelas) {
        const existing = await prisma.kelas.findFirst({
            where: { namaKelas, kodeKelas, NOT: { id } },
        });
        if (existing) throw new Error('Nama kelas sudah digunakan');
    }

    const data = {};
    if (namaKelas) data.namaKelas = namaKelas;
    if (kodeKelas) data.kodeKelas = kodeKelas;

    const updateKelas = await prisma.kelas.update({
        where: { id },
        data: data,
    });

    return updateKelas;
};

export const getKelas = async () => {
    const kelas = await prisma.kelas.findMany({
        select: {
            id: true,
            kodeKelas: true,
            namaKelas: true,
        },
    });
    return kelas;
};

export const getOneKelas = async (id) => {
    const kelas = await prisma.kelas.findUnique({
        where: { id },
        select: {
            id: true,
            kodeKelas: true,
            namaKelas: true,
        },
    });

    return kelas;
};

export const deleteKelas = async (id) => {
    const existingKelas = await prisma.kelas.delete({
        where: { id },
    });
    return existingKelas;
};
