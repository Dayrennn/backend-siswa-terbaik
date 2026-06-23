import prisma from '../config/prisma.js';
import { getKeterangan } from '../helper/nilaiKeterangan.js';

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

    const totalPertemuan = totalHadir + totalIzin + totalSakit + totalAlpha;

    const nilaiKehadiran =
        totalPertemuan > 0 ? ((totalHadir + totalIzin * 0.5 + totalSakit * 0.5) / totalPertemuan) * 100 : 0;

    const nilaiAkhir = parseFloat((0.4 * nilaiKehadiran + 0.6 * (nilaiPerforma ?? 0)).toFixed(2));

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
            totalHadir,
            totalIzin,
            totalAlpha,
            totalSakit,
            nilaiPerforma,
            keterangan,
        },
        create: {
            siswaId,
            eskulId,
            tahunAjaranId: siswa.tahunAjaranId,
            kelasId: siswa.kelasId,
            nilaiAkhir,
            nilaiPerforma,
            totalPertemuan,
            totalHadir,
            totalIzin,
            totalSakit,
            totalAlpha,
            keterangan,
        },
    });

    return nilairekap;
};
