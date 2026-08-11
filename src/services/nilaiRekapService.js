import prisma from '../config/prisma.js';
import { getKeterangan } from '../helper/nilaiKeterangan.js';
import { triggerHitungSMART } from './smartService.js';
import { toScore } from '../helper/validation.js';

export const inputNilaiRekap = async ({ siswaId, pelajaranId, nilaiTugas, nilaiUH, nilaiUTS, nilaiUAS }) => {
    const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
        select: { kelasId: true, tahunAjaranId: true },
    });
    if (!siswa) throw new Error('Siswa tidak ditemukan');
    if (!siswa.kelasId) throw new Error('Siswa tidak memiliki kelas');
    if (!siswa.tahunAjaranId) throw new Error('Siswa tidak memiliki tahun ajaran');

    const nilaiTugasValid = toScore(nilaiTugas, 'Nilai tugas');
    const nilaiUHValid = toScore(nilaiUH, 'Nilai UH');
    const nilaiUTSValid = toScore(nilaiUTS, 'Nilai UTS');
    const nilaiUASValid = toScore(nilaiUAS, 'Nilai UAS');
    const nilaiAkhir = parseFloat(
        ((nilaiTugasValid + nilaiUHValid + nilaiUTSValid + nilaiUASValid) / 4).toFixed(2),
    );

    const keterangan = getKeterangan(nilaiAkhir);

    const nilaiRekap = await prisma.nilaiRekap.upsert({
        where: {
            siswaId_pelajaranId_tahunAjaranId: {
                siswaId,
                pelajaranId,
                tahunAjaranId: siswa.tahunAjaranId,
            },
        },
        update: {
            nilaiTugas: nilaiTugasValid,
            nilaiUH: nilaiUHValid,
            nilaiUTS: nilaiUTSValid,
            nilaiUAS: nilaiUASValid,
            nilaiAkhir,
            keterangan,
        },
        create: {
            siswaId,
            pelajaranId,
            tahunAjaranId: siswa.tahunAjaranId,
            kelasId: siswa.kelasId,
            nilaiTugas: nilaiTugasValid,
            nilaiUH: nilaiUHValid,
            nilaiUTS: nilaiUTSValid,
            nilaiUAS: nilaiUASValid,
            nilaiAkhir,
            keterangan,
        },
    });

    await triggerHitungSMART({ siswaId });
    return nilaiRekap;
};
