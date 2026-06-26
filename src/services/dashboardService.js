import prisma from '../config/prisma.js';

export const getHomeData = async () => {
    const [totalSiswa, totalKelas, totalKriteria, totalUser, totalPelajaran] = await Promise.all([
        prisma.siswa.count(),
        prisma.kelas.count(),
        prisma.kriteria.count(),
        prisma.user.count(),
        prisma.pelajaran.count(),
    ]);

    return {
        totalKelas,
        totalKriteria,
        totalSiswa,
        totalUser,
        totalPelajaran
    };
};
