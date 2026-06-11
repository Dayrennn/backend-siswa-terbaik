import prisma from '../config/prisma.js';

export const addPoin = async ({ siswaId, deskripsi, poin, tanggal }) => {
    if (!siswaId) throw new Error('Siswa Id Tidak Ditemukan');
    if (!deskripsi?.trim()) throw new Error('Deskripsi wajib di isi');
    if (!poin) throw new Error('Poin wajib di isi');

    const newPoin = await prisma.poinMinus.create({
        data: {
            siswaId,
            deskripsi,
            poin: Number(poin),
            tanggal: tanggal ? new Date(tanggal) : new Date(),
        },
    });

    return newPoin;
};
