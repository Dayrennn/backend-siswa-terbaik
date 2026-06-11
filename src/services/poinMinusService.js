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

export const updatePoin = async ({ id, deskripsi, poin, tanggal }) => {
    if (!id) throw new Error('Id Poin Tidak Ditemukan');
    if (!deskripsi?.trim()) throw new Error('Deskripsi wajib di isi');
    if (!poin) throw new Error('Poin wajib di isi');

    const data = {};
    if (deskripsi) data.deskripsi = deskripsi;
    if (poin) data.poin = poin;
    if (tanggal) data.tanggal = new Date(tanggal).toISOString();

    const updatePoin = await prisma.poinMinus.update({
        where: { id },
        data,
        select: {
            id: true,
            siswaId: true,
            deskripsi: true,
            poin: true,
            tanggal: true,
        },
    });

    return updatePoin;
};

export const removePoinMinus = async (id) => {
    const removePoin = await prisma.poinMinus.delete({
        where: {
            id,
        },
    });

    return removePoin;
};