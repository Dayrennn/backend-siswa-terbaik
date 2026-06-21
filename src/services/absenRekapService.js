import prisma from "../config/prisma.js";

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

    const absenRekap = await prisma.absenRekap.upsert({
        where: {
            siswaId_pelajaranId_tahunAjaranId: {
                siswaId,
                pelajaranId,
                tahunAjaranId: siswa.tahunAjaranId,
            },
        },
        update: {
            totalPertemuan,
            totalHadir,
            totalSakit,
            totalIzin,
            totalAlpha,
        },
        create: {
            siswaId,
            pelajaranId,
            tahunAjaranId: siswa.tahunAjaranId,
            kelasId: siswa.kelasId,
            totalPertemuan,
            totalHadir,
            totalSakit,
            totalIzin,
            totalAlpha,
        },
    });

    return absenRekap;
};