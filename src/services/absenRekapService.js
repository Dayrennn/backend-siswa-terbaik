import prisma from '../config/prisma.js';
import { triggerHitungSMART } from './smartService.js';
import { toNonNegativeInteger } from '../helper/validation.js';

export const inputAbsenRekap = async ({
    siswaId,
    pelajaranId,
    totalPertemuan,
    totalHadir,
    totalSakit,
    totalIzin,
    totalAlpha,
}) => {
    const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
        select: { kelasId: true, tahunAjaranId: true },
    });
    if (!siswa) throw new Error('Siswa tidak ditemukan');
    if (!siswa.kelasId) throw new Error('Siswa tidak memiliki kelas');
    if (!siswa.tahunAjaranId) throw new Error('Siswa tidak memiliki tahun ajaran');

    const totalPertemuanValid = toNonNegativeInteger(totalPertemuan, 'Total pertemuan');
    const totalHadirValid = toNonNegativeInteger(totalHadir, 'Total hadir');
    const totalSakitValid = toNonNegativeInteger(totalSakit, 'Total sakit');
    const totalIzinValid = toNonNegativeInteger(totalIzin, 'Total izin');
    const totalAlphaValid = toNonNegativeInteger(totalAlpha, 'Total alpha');
    if (totalHadirValid + totalSakitValid + totalIzinValid + totalAlphaValid > totalPertemuanValid) {
        throw new Error('Jumlah hadir, sakit, izin, dan alpha tidak boleh melebihi total pertemuan');
    }

    const absenRekap = await prisma.absenRekap.upsert({
        where: {
            siswaId_pelajaranId_tahunAjaranId: {
                siswaId,
                pelajaranId,
                tahunAjaranId: siswa.tahunAjaranId,
            },
        },
        update: {
            totalPertemuan: totalPertemuanValid,
            totalHadir: totalHadirValid,
            totalSakit: totalSakitValid,
            totalIzin: totalIzinValid,
            totalAlpha: totalAlphaValid,
        },
        create: {
            siswaId,
            pelajaranId,
            tahunAjaranId: siswa.tahunAjaranId,
            kelasId: siswa.kelasId,
            totalPertemuan: totalPertemuanValid,
            totalHadir: totalHadirValid,
            totalSakit: totalSakitValid,
            totalIzin: totalIzinValid,
            totalAlpha: totalAlphaValid,
        },
    });

    await triggerHitungSMART({ siswaId });
    return absenRekap;
};
