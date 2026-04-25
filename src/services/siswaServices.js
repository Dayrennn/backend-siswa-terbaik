import prisma from '../config/prisma.js';

// tambah siswa
export const addSiswa = async ({ nis, namaSiswa, tanggalLahir, kelasId, tahunAjaranId }) => {
    const existingSiswa = await prisma.siswa.findFirst({
        where: {
            OR: [{ nis }, { namaSiswa }],
        },
    });

    if (existingSiswa) throw new Error('Data siswa sudah ada');

    // ambil semua pelajaran dan kriteria otomatis
    const allPelajaran = await prisma.pelajaran.findMany();
    const allKriteria = await prisma.kriteria.findMany();
    const allKehadiran = await prisma.kehadiran.findMany();

    const newSiswa = await prisma.siswa.create({
        data: {
            nis: nis,
            namaSiswa: namaSiswa,
            tanggalLahir: new Date(tanggalLahir),
            kelas: kelasId ? { connect: { id: kelasId } } : undefined,
            // isi nilai otomatis, default 0
            nilai: {
                create: allPelajaran.map((pelajaran) => ({
                    pelajaranId: pelajaran.id,
                    nilai: 0,
                    tahunAjaranId: tahunAjaranId,
                })),
            },
            nilaiKriteria: {
                create: allKriteria.map((kriteria) => ({
                    kriteriaId: kriteria.id,
                    nilai: 0,
                })),
            },
            tahunAjaran: {
                connect: { id: tahunAjaranId },
            },
            kehadiran: {
                create: allKehadiran.map((kehadiran) => ({
                    kehadiranId: kehadiran.id,
                    statusKehadiran: 'Alpha',
                })),
            },
        },
    });

    return newSiswa;
};

// update siswa
export const updateSiswa = async (
    id,
    { nis, namaSiswa, tanggalLahir, kelasId, nilai, nilaiKriteria },
) => {
    const existingSiswa = await prisma.siswa.findUnique({
        where: { id },
    });

    if (!existingSiswa) throw new Error('Siswa tidak ditemukan');

    if (nis || namaSiswa) {
        const existing = await prisma.siswa.findFirst({
            where: {
                OR: [nis ? { nis } : undefined, namaSiswa ? { namaSiswa } : undefined].filter(
                    Boolean,
                ),
                NOT: { id },
            },
        });
        if (existing) throw new Error('nis dan nama sudah digunakan');
    }

    const data = {};
    if (nis) data.nis = nis;
    if (namaSiswa) data.namaSiswa = namaSiswa;
    if (tanggalLahir) data.tanggalLahir = new Date(tanggalLahir);
    if (kelasId) data.kelas = { connect: { id: kelasId } };

    // Update nilai jika dikirim
    if (nilai) {
        data.nilai = {
            upsert: nilai.map((n) => ({
                where: {
                    siswaId_pelajaranId: {
                        siswaId: id,
                        pelajaranId: n.pelajaranId,
                    },
                },
                update: { nilai: n.nilai },
                create: { nilai: n.nilai, pelajaranId: n.pelajaranId },
            })),
        };
    }

    if (nilaiKriteria) {
        data.nilaiKriteria = {
            upsert: nilaiKriteria.map((n) => ({
                where: {
                    siswaId_kriteriaId: {
                        siswaId: id,
                        kriteriaId: n.kriteriaId,
                    },
                },
                update: { nilai: n.nilai },
                create: { nilai: n.nilai, kriteriaId: n.kriteriaId },
            })),
        };
    }

    const updateSiswa = await prisma.siswa.update({
        where: { id },
        data,
        include: {
            nilai: {
                include: {
                    pelajaran: true,
                },
            },
            nilaiKriteria: {
                include: {
                    kriteria: true,
                },
            },
        },
    });
    return updateSiswa;
};

export const getAllSiswa = async () => {
    const siswas = await prisma.siswa.findMany({
        include: {
            tahunAjaran: true,
            kelas: true,
            nilai: {
                include: {
                    pelajaran: true,
                },
            },
            nilaiKriteria: {
                include: {
                    kriteria: true,
                },
            },
        },
    });

    return siswas;
};

export const getOneSiswa = async (id) => {
    const siswas = await prisma.siswa.findUnique({
        where: { id },
        include: {
            nilai: {
                include: {
                    pelajaran: true,
                },
            },
            nilaiKriteria: {
                include: {
                    kriteria: true,
                },
            },
        },
    });

    return siswas;
};

// delete siswa
export const deleteSiswa = async (id) => {
    await prisma.nilai.deleteMany({
        where: { siswaId: id },
    });
    await prisma.nilaiKriteria.deleteMany({
        where: { siswaId: id },
    });
    await prisma.kehadiran.deleteMany({
        where: { siswaId: id },
    });
    const siswas = await prisma.siswa.delete({
        where: { id },
    });
    return siswas;
};

export const getSiswaByTahunAjaran = async (tahunAjaranId) => {
    const siswas = await prisma.siswa.findMany({
        where: { tahunAjaranId },
        include: {
            kelas: true,
            tahunAjaran: true,
            nilai: {
                include: {
                    pelajaran: true,
                },
            },
            nilaiKriteria: {
                include: {
                    kriteria: true,
                },
            },
        },
    });
    return siswas;
};
