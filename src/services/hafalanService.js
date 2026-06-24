import prisma from '../config/prisma.js';
import { getKeteranganHafalan } from '../helper/nilaiKeterangan.js';
import { triggerHitungSMART } from './smartService.js';

export const inputHafalan = async ({ siswaId, jumlahJuz }) => {
    const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
    });

    if (!siswa) {
        throw new Error('Siswa tidak ditemukan');
    }

    const keterangan = getKeteranganHafalan(jumlahJuz);

    const hafalanRekap = await prisma.hafalan.upsert({
        where: { siswaId },
        update: { jumlahJuz, keterangan },
        create: { siswaId, jumlahJuz, keterangan },
    });

    await triggerHitungSMART({ siswaId });
    return hafalanRekap;
};
