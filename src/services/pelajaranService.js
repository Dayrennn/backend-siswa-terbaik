import prisma from '../config/prisma.js';

export const addPelajaran = async ({ namaPelajaran, kodePelajaran }) => {
    const existingPelajaran = await prisma.pelajaran.findFirst({
        where: {
            OR: [{ namaPelajaran }],
        },
    });

    if (existingPelajaran) throw new Error('Data sudah ada');

    const newPelajaran = await prisma.pelajaran.create({
        data: {
            namaPelajaran: namaPelajaran,
            kodePelajaran: kodePelajaran,
        },
    });

    const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
        where: { status: 'Aktif' },
    });

    if (tahunAjaranAktif) {
        const allSiswa = await prisma.siswa.findMany({
            where: { tahunAjaranId: tahunAjaranAktif.id, NOT: { kelasId: null } },
            select: { id: true, kelasId: true },
        });
        if (allSiswa.length > 0) {
            await prisma.nilaiRekap.createMany({
                data: allSiswa.map((siswa) => ({
                    siswaId: siswa.id,
                    pelajaranId: newPelajaran.id,
                    tahunAjaranId: tahunAjaranAktif.id,
                    kelasId: siswa.kelasId,
                    nilaiAkhir: 0,
                })),
                skipDuplicates: true,
            });
        }
    }

    return newPelajaran;
};

export const updatePelajaran = async (id, { namaPelajaran, kodePelajaran, guruId }) => {
    const existingPelajaran = await prisma.pelajaran.findUnique({
        where: { id },
    });

    if (!existingPelajaran) throw new Error('Pelajaran tidak di temukan');

    if (namaPelajaran || kodePelajaran) {
        const existing = await prisma.pelajaran.findFirst({
            where: {
                OR: [namaPelajaran ? { namaPelajaran } : undefined, kodePelajaran ? { kodePelajaran } : undefined],
                NOT: { id },
            },
        });
        if (existing) throw new Error('nama atau kode sudah digunakan');
    }

    const data = {};
    if (namaPelajaran) data.namaPelajaran = namaPelajaran;
    if (kodePelajaran) data.kodePelajaran = kodePelajaran;
    if (guruId) data.guruId = guruId;

    const updatePelajaran = await prisma.pelajaran.update({
        where: { id },
        data,
        select: {
            id: true,
            namaPelajaran: true,
            kodePelajaran: true,
            guruId: true,
        },
    });

    return updatePelajaran;
};

export const getAllPelajaran = async () => {
    const pelajarans = await prisma.pelajaran.findMany({
        select: {
            id: true,
            namaPelajaran: true,
            kodePelajaran: true,
            guru: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    return pelajarans;
};

export const getOnePelajaran = async (id) => {
    const pelajarans = await prisma.pelajaran.findUnique({
        where: { id },
        select: {
            id: true,
            namaPelajaran: true,
            kodePelajaran: true,
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    return pelajarans;
};

export const deletePelajaran = async (id) => {
    const pelajarans = await prisma.pelajaran.delete({
        where: { id },
    });

    return pelajarans;
};
