import prisma from '../config/prisma.js';

// tambah siswa
export const addSiswa = async ({ nis, namaSiswa, tanggalLahir, kelasId, tahunAjaranId }) => {
    const existingSiswa = await prisma.siswa.findFirst({
        where: {
            OR: [{ nis }, { namaSiswa }],
        },
    });

    if (existingSiswa) throw new Error('Data siswa sudah ada');

    const allPelajaran = await prisma.pelajaran.findMany();
    const allKriteria = await prisma.kriteria.findMany();

    // ambil semua pertemuan di kelas dan tahun ajaran yang sama
    const allPertemuan = await prisma.pertemuan.findMany({
        where: {
            kelasId,
            tahunAjaranId,
        },
    });

    const newSiswa = await prisma.siswa.create({
        data: {
            nis,
            namaSiswa,
            tanggalLahir: new Date(tanggalLahir),
            kelas: kelasId ? { connect: { id: kelasId } } : undefined,
            tahunAjaran: {
                connect: { id: tahunAjaranId },
            },
            nilai: {
                create: allPelajaran.map((pelajaran) => ({
                    pelajaranId: pelajaran.id,
                    nilai: 0,
                    tahunAjaranId,
                })),
            },
            nilaiKriteria: {
                create: allKriteria.map((kriteria) => ({
                    kriteriaId: kriteria.id,
                    nilai: 0,
                })),
            },
            // generate kehadiran Alpha per pertemuan
            kehadiran: {
                create: allPertemuan.map((pertemuan) => ({
                    pertemuanId: pertemuan.id,
                    kelasId,
                    tahunAjaranId,
                    statusKehadiran: 'Alpha',
                })),
            },
            nilaiAkademik: {
                create: allPelajaran.flatMap((pelajaran) =>
                    ['Tugas', 'UlanganHarian', 'UTS', 'UAS'].map((jenis) => ({
                        pelajaranId: pelajaran.id,
                        tahunAjaranId,
                        kelasId,
                        jenis,
                    })),
                ),
            },
        },
    });

    return newSiswa;
};

// update siswa
export const updateSiswa = async (id, { nis, namaSiswa, tanggalLahir, kelasId, nilai, nilaiKriteria }) => {
    const existingSiswa = await prisma.siswa.findUnique({
        where: { id },
    });

    if (!existingSiswa) throw new Error('Siswa tidak ditemukan');

    if (nis || namaSiswa) {
        const existing = await prisma.siswa.findFirst({
            where: {
                OR: [nis ? { nis } : undefined, namaSiswa ? { namaSiswa } : undefined].filter(Boolean),
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
                create: { nilai: n.nilai, pelajaranId: n.pelajaranId, tahunAjaranId: existingSiswa.tahunAjaranId },
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
                include: { pelajaran: true },
            },
            nilaiKriteria: {
                include: { kriteria: true },
            },
            kehadiran: {
                select: {
                    statusKehadiran: true,
                    tanggalKehadiran: true,
                },
            },
            poinPlus: {
                select: { id: true, siswaId: true, deskripsi: true, poin: true, tanggal: true },
                orderBy: { tanggal: 'desc' },
                take: 5,
            },
            poinMinus: {
                select: { id: true, siswaId: true, deskripsi: true, poin: true, tanggal: true },
                orderBy: { tanggal: 'desc' },
                take: 5,
            },
            _count: {
                select: { poinPlus: true, poinMinus: true },
            },
        },
    });
    const siswaIds = siswas.map((s) => s.id);

    const [allPlus, allMinus] = await Promise.all([
        prisma.poinPlus.groupBy({
            by: ['siswaId'],
            where: { siswaId: { in: siswaIds } },
            _sum: { poin: true },
        }),
        prisma.poinMinus.groupBy({
            by: ['siswaId'],
            where: { siswaId: { in: siswaIds } },
            _sum: { poin: true },
        }),
    ]);

    const plusMap = Object.fromEntries(allPlus.map((p) => [p.siswaId, p._sum.poin ?? 0]));
    const minusMap = Object.fromEntries(allMinus.map((p) => [p.siswaId, p._sum.poin ?? 0]));

    return siswas.map((s) => ({
        ...s,
        totalPoinPlus: plusMap[s.id] ?? 0,
        totalPoinMinus: minusMap[s.id] ?? 0,
    }));
};

export const getOneSiswa = async (id) => {
    const [siswa, allPoinPlus, allPoinMinus] = await Promise.all([
        prisma.siswa.findUnique({
            where: { id },
            include: {
                kelas: true,
                nilai: { include: { pelajaran: true } },
                nilaiKriteria: { include: { kriteria: true } },
                kehadiran: {
                    select: { statusKehadiran: true, tanggalKehadiran: true },
                },
                poinPlus: {
                    select: { id: true, siswaId: true, deskripsi: true, poin: true, tanggal: true },
                },
                poinMinus: {
                    select: { id: true, siswaId: true, deskripsi: true, poin: true, tanggal: true },
                },
                _count: {
                    select: { poinPlus: true, poinMinus: true },
                },
            },
        }),
        prisma.poinPlus.aggregate({ where: { siswaId: id }, _sum: { poin: true } }),
        prisma.poinMinus.aggregate({ where: { siswaId: id }, _sum: { poin: true } }),
    ]);

    if (!siswa) return null;

    const totalNilai = siswa.nilai.reduce((sum, n) => sum + n.nilai, 0);
    const rataRataNilai = siswa.nilai.length > 0 ? totalNilai / siswa.nilai.length : 0;

    const totalBobot = siswa.nilaiKriteria.reduce((sum, nk) => sum + nk.kriteria.bobot, 0);
    const totalNilaiKriteriaBerbobot = siswa.nilaiKriteria.reduce((sum, nk) => sum + nk.nilai * nk.kriteria.bobot, 0);
    const rataRataNilaiKriteria = totalBobot > 0 ? totalNilaiKriteriaBerbobot / totalBobot : 0;

    const totalKehadiran = siswa.kehadiran.length;
    const rekapKehadiran = siswa.kehadiran.reduce((acc, k) => {
        acc[k.statusKehadiran] = (acc[k.statusKehadiran] || 0) + 1;
        return acc;
    }, {});
    const persentaseHadir = totalKehadiran > 0 ? ((rekapKehadiran['Hadir'] || 0) / totalKehadiran) * 100 : 0;

    return {
        ...siswa,
        totalPoinPlus: allPoinPlus._sum.poin ?? 0,
        totalPoinMinus: allPoinMinus._sum.poin ?? 0,
        ringkasan: {
            rataRataNilai: parseFloat(rataRataNilai.toFixed(2)),
            rataRataNilaiKriteria: parseFloat(rataRataNilaiKriteria.toFixed(2)),
            totalKehadiran,
            rekapKehadiran,
            persentaseHadir: parseFloat(persentaseHadir.toFixed(2)),
        },
    };
};

// delete siswa
export const deleteSiswa = async (id) => {
    await prisma.nilai.deleteMany({
        where: { siswaId: id },
    });
    await prisma.nilaiKriteria.deleteMany({
        where: { siswaId: id },
    });
    await prisma.nilaiAkademik.deleteMany({
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

export const getSiswaByTahunAjaranAndKelas = async (tahunAjaranId, kelasId) => {
    const siswas = await prisma.siswa.findMany({
        where: { tahunAjaranId, kelasId },
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

export const getSiswaWithKehadiran = async () => {
    const siswas = await prisma.siswa.findMany({
        select: {
            id: true,
            namaSiswa: true,
            kelas: {
                select: {
                    kodeKelas: true,
                },
            },
            kehadiran: {
                select: {
                    statusKehadiran: true,
                    tanggalKehadiran: true,
                },
            },
        },
    });

    return siswas;
};
