import prisma from '../config/prisma.js';
import { getKeterangan } from '../helper/nilaiKeterangan.js';

export const inputNilaiEskul = async ({
    siswaId,
    eskulId,
    nilaiAkhir,
    totalPertemuan,
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

    const keterangan = getKeterangan(nilaiAkhir);

    const nilairekap = await prisma.nilaiEskulRekap.upsert({
        where: {
            siswaId_eskulId_tahunAjaranId: {
                siswaId,
                eskulId,
                tahunAjaranId: siswa.tahunAjaranId,
            },
        },
        update: { nilaiAkhir, totalPertemuan, totalHadir, totalIzin, totalAlpha, totalSakit },
        create: {
            siswaId,
            eskulId,
            tahunAjaranId: siswa.tahunAjaranId,
            kelasId: siswa.kelasId,
            nilaiAkhir,
            totalPertemuan,
            totalHadir,
            totalIzin,
            totalSakit,
            totalAlpha,
        },
    });

    return nilairekap;
};
