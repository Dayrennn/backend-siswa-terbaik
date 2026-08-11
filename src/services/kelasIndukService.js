import prisma from '../config/prisma.js';

export const getKelasInduk = async () => {
    const kelasIndukList = await prisma.kelasInduk.findMany({
        orderBy: { namaKelasInduk: 'asc' },
    });

    return kelasIndukList;
};
