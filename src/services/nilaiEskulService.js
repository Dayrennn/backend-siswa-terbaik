import prisma from '../config/prisma.js';
import { getKeterangan } from '../helper/nilaiKeterangan.js';
import { triggerHitungSMART } from './smartService.js';
import { toNonNegativeInteger, toScore } from '../helper/validation.js';

export const inputNilaiEskul = async ({
    siswaId,
    eskulId,
    nilaiPerforma,
    totalHadir,
    totalIzin,
    totalSakit,
    totalAlpha,
}) => {
    const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
        select: {
            kelasId: true,
            tahunAjaranId: true,
        },
    });
    if (!siswa) throw new Error('Siswa tidak ditemukan');
    if (!siswa.kelasId) throw new Error('Siswa tidak memiliki kelas');
    if (!siswa.tahunAjaranId) throw new Error('Siswa tidak memiliki tahun ajaran');

    const nilaiPerformaValid = toScore(nilaiPerforma, 'Nilai performa');
    const totalHadirValid = toNonNegativeInteger(totalHadir, 'Total hadir');
    const totalIzinValid = toNonNegativeInteger(totalIzin, 'Total izin');
    const totalSakitValid = toNonNegativeInteger(totalSakit, 'Total sakit');
    const totalAlphaValid = toNonNegativeInteger(totalAlpha, 'Total alpha');
    const totalPertemuan = totalHadirValid + totalIzinValid + totalSakitValid + totalAlphaValid;

    const nilaiKehadiran =
        totalPertemuan > 0
            ? ((totalHadirValid + totalIzinValid * 0.5 + totalSakitValid * 0.5) / totalPertemuan) * 100
            : 0;

    const nilaiAkhir = parseFloat((0.4 * nilaiKehadiran + 0.6 * nilaiPerformaValid).toFixed(2));

    const keterangan = getKeterangan(nilaiAkhir);

    const nilairekap = await prisma.nilaiEskulRekap.upsert({
        where: {
            siswaId_eskulId_tahunAjaranId: {
                siswaId,
                eskulId,
                tahunAjaranId: siswa.tahunAjaranId,
            },
        },
        update: {
            nilaiAkhir,
            totalPertemuan,
            totalHadir: totalHadirValid,
            totalIzin: totalIzinValid,
            totalAlpha: totalAlphaValid,
            totalSakit: totalSakitValid,
            nilaiPerforma: nilaiPerformaValid,
            keterangan,
        },
        create: {
            siswaId,
            eskulId,
            tahunAjaranId: siswa.tahunAjaranId,
            kelasId: siswa.kelasId,
            nilaiAkhir,
            nilaiPerforma: nilaiPerformaValid,
            totalPertemuan,
            totalHadir: totalHadirValid,
            totalIzin: totalIzinValid,
            totalSakit: totalSakitValid,
            totalAlpha: totalAlphaValid,
            keterangan,
        },
    });

    await triggerHitungSMART({ siswaId });
    return nilairekap;
};
