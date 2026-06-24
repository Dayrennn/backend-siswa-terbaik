import prisma from '../config/prisma.js';

export const inputHafalan = async ({ siswaId, jumlahJuz, keterangan }) => {
    const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
    });

    if (!siswa) {
        throw new Error('Siswa tidak ditemukan');
    }

    const hafalanRekap = await prisma.hafalan.upsert({
        where: { siswaId },
        update: { jumlahJuz, keterangan },
        create: { siswaId, jumlahJuz, keterangan },
    });

    return hafalanRekap;
};
