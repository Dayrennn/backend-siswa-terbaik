import prisma from '../config/prisma.js';

export const addTahunAjaran = async ({ namaTahunAjaran, status }) => {
    if (!namaTahunAjaran) {
        throw new Error('Nama tahun ajaran wajib diisi');
    }
    const existingTahunAjaran = await prisma.tahunAjaran.findFirst({
        where: {
            OR: [{ namaTahunAjaran }],
        },
    });

    if (existingTahunAjaran) throw new Error('Data sudah ada');

    if (status === 'Aktif') {
        await prisma.tahunAjaran.updateMany({
            where: { status: 'Aktif' },
            data: { status: 'Nonaktif' },
        });
    }

    const newTahunAjaran = await prisma.tahunAjaran.create({
        data: {
            namaTahunAjaran: namaTahunAjaran,
            status: status || 'Aktif',
        },
    });

    return newTahunAjaran;
};

export const updateTahunAjaran = async (id, { namaTahunAjaran, status }) => {
    const existingTahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id },
    });

    if (!existingTahunAjaran) throw new Error('Tahun Ajaran tidak di temukan');

    if (namaTahunAjaran) {
        const existing = await prisma.tahunAjaran.findFirst({
            where: {
                OR: [namaTahunAjaran ? { namaTahunAjaran } : undefined],
                NOT: { id },
            },
        });
        if (existing) throw new Error('nama sudah digunakan');
    }

    if (status === 'Aktif') {
        await prisma.tahunAjaran.updateMany({
            where: {
                status: 'Aktif',
                NOT: { id },
            },
            data: {
                status: 'Nonaktif',
            },
        });
    }

    const data = {};
    if (namaTahunAjaran) data.namaTahunAjaran = namaTahunAjaran;
    if (status) data.status = status;

    const updateTahunAjaran = await prisma.tahunAjaran.update({
        where: { id },
        data,
        select: {
            id: true,
            namaTahunAjaran: true,
            status: true,
        },
    });

    return updateTahunAjaran;
};

export const getAllTahunAjaran = async () => {
    const tahunAjarans = await prisma.tahunAjaran.findMany({
        select: {
            id: true,
            namaTahunAjaran: true,
            status: true,
        },
    });
    return tahunAjarans;
};

export const getOneTahunAjaran = async (id) => {
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id },
        select: {
            id: true,
            namaTahunAjaran: true,
            status: true,
        },
    });
    return tahunAjaran;
};

export const deleteTahunAjaran = async (id) => {
    const tahunAjaran = await prisma.tahunAjaran.delete({
        where: { id },
    });

    return tahunAjaran;
};
