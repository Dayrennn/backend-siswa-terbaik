import prisma from '../config/prisma.js';
import { getKeterangan } from '../helper/nilaiKeterangan.js';

export const inputNilaiRekap = async ({ siswaId, pelajaranId, nilaiTugas, nilaiUH, nilaiUTS, nilaiUAS }) => {
    const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
        select: { kelasId: true, tahunAjaranId: true },
    });
    if (!siswa) throw new Error('Siswa tidak ditemukan');
    if (!siswa.kelasId) throw new Error('Siswa tidak memiliki kelas');
    if (!siswa.tahunAjaranId) throw new Error('Siswa tidak memiliki tahun ajaran');

    const nilaiAkhir = parseFloat(
        (((nilaiTugas ?? 0) + (nilaiUH ?? 0) + (nilaiUTS ?? 0) + (nilaiUAS ?? 0)) / 4).toFixed(2),
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
        update: { nilaiTugas, nilaiUH, nilaiUTS, nilaiUAS, nilaiAkhir, keterangan },
        create: {
            siswaId,
            pelajaranId,
            tahunAjaranId: siswa.tahunAjaranId,
            kelasId: siswa.kelasId,
            nilaiTugas,
            nilaiUH,
            nilaiUTS,
            nilaiUAS,
            nilaiAkhir,
            keterangan,
        },
    });

    return nilaiRekap;
};
