import prisma from '../config/prisma.js';
import { getKeteranganHafalan } from '../helper/nilaiKeterangan.js';
import { triggerHitungSMART } from './smartService.js';
import { toNonNegativeInteger } from '../helper/validation.js';

export const inputHafalan = async ({ siswaId, jumlahJuz }) => {
    const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
    });

    if (!siswa) {
        throw new Error('Siswa tidak ditemukan');
    }

    const jumlahJuzValid = toNonNegativeInteger(jumlahJuz, 'Jumlah juz');
    if (jumlahJuzValid > 30) throw new Error('Jumlah juz tidak boleh lebih dari 30');
    const keterangan = getKeteranganHafalan(jumlahJuzValid);

    const hafalanRekap = await prisma.hafalan.upsert({
        where: { siswaId },
        update: { jumlahJuz: jumlahJuzValid, keterangan },
        create: { siswaId, jumlahJuz: jumlahJuzValid, keterangan },
    });

    await triggerHitungSMART({ siswaId });
    return hafalanRekap;
};
