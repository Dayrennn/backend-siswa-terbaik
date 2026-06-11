import prisma from '../config/prisma.js';

export const addPoin = async ({ siswaId, deskripsi, poin, tanggal }) => {
    if (!siswaId) throw new Error('Siswa Id Tidak Ditemukan');
    if (!deskripsi?.trim()) throw new Error('Deskripsi wajib di isi');
    if (!poin) throw new Error('Poin wajib di isi');

    const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
    });

    if (!siswa) throw new Error(`Siswa dengan id ${siswaId} tidak ditemukan`);

    const newPoin = await prisma.poinPlus.create({
        data: {
            siswaId,
            deskripsi,
            poin: Number(poin),
            tanggal: tanggal ? new Date(tanggal) : new Date(),
        },
    });

    return newPoin;
};
