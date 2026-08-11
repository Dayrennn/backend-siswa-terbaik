import prisma from '../config/prisma.js';
import { triggerHitungSMART } from './smartService.js';
import { toPositiveInteger } from '../helper/validation.js';

export const addPoin = async ({ siswaId, tahunAjaranId, deskripsi, poin, tanggal }) => {
    if (!siswaId) throw new Error('Siswa Id Tidak Ditemukan');
    if (!deskripsi?.trim()) throw new Error('Deskripsi wajib di isi');
    const poinValid = toPositiveInteger(poin, 'Poin');

    const siswa = await prisma.siswa.findUnique({ where: { id: siswaId }, select: { tahunAjaranId: true } });
    if (!siswa) throw new Error(`Siswa dengan id ${siswaId} tidak ditemukan`);

    const newPoin = await prisma.poinMinus.create({
        data: {
            siswaId,
            tahunAjaranId: tahunAjaranId ?? siswa.tahunAjaranId,
            deskripsi,
            poin: poinValid,
            tanggal: tanggal ? new Date(tanggal) : new Date(),
        },
    });

    await triggerHitungSMART({ siswaId });
    return newPoin;
};

export const updatePoin = async ({ id, deskripsi, poin, tanggal }) => {
    if (!id) throw new Error('Id Poin Tidak Ditemukan');
    if (!deskripsi?.trim()) throw new Error('Deskripsi wajib di isi');
    const poinValid = toPositiveInteger(poin, 'Poin');

    const data = {};
    if (deskripsi) data.deskripsi = deskripsi;
    data.poin = poinValid;
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

    await triggerHitungSMART({ siswaId: updatePoin.siswaId });
    return updatePoin;
};

export const removePoinMinus = async (id) => {
    const removePoin = await prisma.poinMinus.delete({
        where: {
            id,
        },
    });

    await triggerHitungSMART({ siswaId: removePoin.siswaId });
    return removePoin;
};
