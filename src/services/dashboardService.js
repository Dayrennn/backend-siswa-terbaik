import prisma from '../config/prisma.js';

export const getHomeData = async () => {
    const [totalSiswa, totalKelas, totalKriteria, totalUser] = await Promise.all([
        prisma.siswa.count(),
        prisma.kelas.count(),
        prisma.kriteria.count(),
        prisma.user.count(),
    ]);

    return {
        totalKelas,
        totalKriteria,
        totalSiswa,
        totalUser,
    };
};
