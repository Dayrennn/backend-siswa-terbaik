import prisma from "../config/prisma.js";

export const inputNilaiAkademik = async ({ kelasId, tahunAjaranId, pelajaranId, jenis, nilaiSiswa }) => {
    const results = await Promise.all(
        nilaiSiswa.map(({ siswaId, nilai }) =>
            prisma.nilaiAkademik.upsert({
                where: {
                    siswaId_pelajaranId_tahunAjaranId_jenis: {
                        siswaId,
                        pelajaranId,
                        tahunAjaranId,
                        jenis,
                    },
                },
                update: { nilai },
                create: {
                    siswaId,
                    kelasId,
                    tahunAjaranId,
                    pelajaranId,
                    jenis,
                    nilai,
                },
            })
        )
    );

    return results;
};