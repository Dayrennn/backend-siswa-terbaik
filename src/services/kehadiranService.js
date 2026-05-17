import prisma from '../config/prisma.js';

export const addKehadiran = async ({
    siswaId,
    kelasId,
    tahunAjaranId,
    statusKehadiran,
    tanggalKehadiran,
    pertemuanId,
}) => {
    // cek field
    if (!siswaId) {
        throw new Error('Siswa wajib di pilih');
    }
    if (!tahunAjaranId) {
        throw new Error('Tahun ajaran wajib di isi');
    }
    if (!pertemuanId) {
        throw new Error('Pertemuan wajib di pilih');
    }

    const tanggal = new Date(tanggalKehadiran);

    // karena udah pake unique jadi try catch aja
    try {
        return await prisma.kehadiran.create({
            data: {
                siswaId,
                tahunAjaranId,
                kelasId,
                statusKehadiran,
                tanggalKehadiran: tanggal,
                pertemuanId,
            },
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('Kehadiran di tanggal ini sudah ada');
        }
        throw error;
    }
};

export const updateKehadiran = async ({ pertemuanId, kelasId, siswaId, statusKehadiran }) => {
    const kehadirans =  await prisma.kehadiran.updateMany({
        where: {
            kelasId,
            pertemuanId,
            siswaId,
        },
        data: {
            statusKehadiran,
            tanggalKehadiran: new Date(),
        }
    });

    return kehadirans;
};

export const getAllKehadiran = async () => {
    const kehadirans = await prisma.kehadiran.findMany({
        select: {
            id: true,
            tahunAjaran: true,
            statusKehadiran: true,
            tanggalKehadiran: true,
            siswa: {
                select: {
                    name: true,
                    kelas: true,
                },
            },
        },
        orderBy: {
            tanggalKehadiran: 'desc',
        },
    });

    return kehadirans;
};

export const getKehadiranRekap = async ({ siswaId, tahunAjaran, kelas }) => {
    const kehadirans = await prisma.kehadiran.findMany({
        where: {
            ...(siswaId && { siswaId }),
            ...(tahunAjaran && { tahunAjaran }),
            ...(kelas && { siswa: { kelas } }),
        },
        include: {
            siswa: {
                select: {
                    name: true,
                    kelas: true,
                },
            },
        },
        orderBy: {
            tanggalKehadiran: 'desc',
        },
    });

    return kehadirans;
};

export const getOneKehadiran = async (id) => {
    const kehadirans = await prisma.kehadiran.findUnique({
        where: { id },
        select: {
            id: true,
            tahunAjaran: true,
            statusKehadiran: true,
            tanggalKehadiran: true,
            siswa: {
                select: {
                    name: true,
                    kelas: true,
                },
            },
        },
    });

    return kehadirans;
};

export const getKehadiranByPertemuan = async ({ tahunAjaranId, kelasId, pertemuanId }) => {
    const kehadirans = await prisma.kehadiran.findMany({
        where: {
            tahunAjaranId,
            pertemuanId,
            kelasId,
        },
        include: {
            siswa: true,
            kelas: true,
            tahunAjaran: true,
        },
    });

    return kehadirans;
};
