import prisma from '../config/prisma.js';

// tambah siswa
export const addSiswa = async ({ nis, namaSiswa, tanggalLahir, kelasId, tahunAjaranId }) => {
    const existingSiswa = await prisma.siswa.findFirst({
        where: {
            OR: [{ nis }, { namaSiswa }],
        },
    });

    if (existingSiswa) throw new Error('Data siswa sudah ada');

    const newSiswa = await prisma.siswa.create({
        data: {
            nis,
            namaSiswa,
            tanggalLahir: new Date(tanggalLahir),
            kelas: kelasId ? { connect: { id: kelasId } } : undefined,
            tahunAjaran: {
                connect: { id: tahunAjaranId },
            },
        },
    });

    const allPelajaran = await prisma.pelajaran.findMany({
        select: { id: true },
    });

    if (allPelajaran.length > 0 && kelasId) {
        await prisma.absenRekap.createMany({
            data: allPelajaran.map((p) => ({
                siswaId: newSiswa.id,
                pelajaranId: p.id,
                tahunAjaranId,
                kelasId,
                totalPertemuan: 0,
                totalHadir: 0,
                totalSakit: 0,
                totalIzin: 0,
                totalAlpha: 0,
            })),
            skipDuplicates: true,
        });
        await prisma.nilaiRekap.createMany({
            data: allPelajaran.map((p) => ({
                siswaId: newSiswa.id,
                pelajaranId: p.id,
                tahunAjaranId,
                kelasId,
                nilaiAkhir: 0,
            })),
            skipDuplicates: true,
        });
    }

    return newSiswa;
};

// update siswa
export const updateSiswa = async (id, { nis, namaSiswa, tanggalLahir, kelasId, tahunAjaranId }) => {
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
    if (tahunAjaranId) data.tahunAjaran = { connect: { id: tahunAjaranId } };

    const updatedSiswa = await prisma.siswa.update({
        where: { id },
        data,
    });

    return updatedSiswa;
};

export const getAllSiswa = async () => {
    const siswas = await prisma.siswa.findMany({
        include: {
            tahunAjaran: true,
            kelas: true,
            absenRekap: {
                include: { pelajaran: true },
            },
            nilaiRekap: {
                include: { pelajaran: true },
            },
            nilaiEskulRekap: {
                include: { eskul: true },
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
                nilaiRekap: {
                    include: { pelajaran: true },
                },
                absenRekap: {
                    include: { pelajaran: true },
                },
                nilaiEskulRekap: {
                    include: { eskul: true },
                },
                nilaiKriteria: {
                    include: { kriteria: true },
                },
                hafalan: true,
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

    const totalNilaiRekap = siswa.nilaiRekap.reduce((sum, n) => sum + n.nilaiAkhir, 0);
    const rataRataNilai = siswa.nilaiRekap.length > 0 ? totalNilaiRekap / siswa.nilaiRekap.length : 0;

    const totalBobot = siswa.nilaiKriteria.reduce((sum, nk) => sum + nk.kriteria.bobot, 0);
    const totalNilaiKriteriaBerbobot = siswa.nilaiKriteria.reduce(
        (sum, nk) => sum + nk.nilaiNormalisasi * nk.kriteria.bobot,
        0,
    );
    const rataRataNilaiKriteria = totalBobot > 0 ? totalNilaiKriteriaBerbobot / totalBobot : 0;

    // rekap kehadiran dari absenRekap (akumulasi semua pelajaran)
    const rekapKehadiran = siswa.absenRekap.reduce(
        (acc, a) => {
            acc.totalPertemuan += a.totalPertemuan;
            acc.hadir += a.totalHadir;
            acc.sakit += a.totalSakit;
            acc.izin += a.totalIzin;
            acc.alpha += a.totalAlpha;
            return acc;
        },
        { totalPertemuan: 0, hadir: 0, sakit: 0, izin: 0, alpha: 0 },
    );

    const persentaseHadir =
        rekapKehadiran.totalPertemuan > 0 ? (rekapKehadiran.hadir / rekapKehadiran.totalPertemuan) * 100 : 0;

    return {
        ...siswa,
        totalPoinPlus: allPoinPlus._sum.poin ?? 0,
        totalPoinMinus: allPoinMinus._sum.poin ?? 0,
        ringkasan: {
            rataRataNilai: parseFloat(rataRataNilai.toFixed(2)),
            rataRataNilaiKriteria: parseFloat(rataRataNilaiKriteria.toFixed(2)),
            rekapKehadiran,
            persentaseHadir: parseFloat(persentaseHadir.toFixed(2)),
        },
    };
};

// delete siswa
export const deleteSiswa = async (id) => {
    // hapus semua relasi sebelum delete siswa
    await Promise.all([
        prisma.nilaiRekap.deleteMany({ where: { siswaId: id } }),
        prisma.absenRekap.deleteMany({ where: { siswaId: id } }),
        prisma.nilaiEskulRekap.deleteMany({ where: { siswaId: id } }),
        prisma.nilaiKriteria.deleteMany({ where: { siswaId: id } }),
        prisma.poinPlus.deleteMany({ where: { siswaId: id } }),
        prisma.poinMinus.deleteMany({ where: { siswaId: id } }),
        prisma.hafalan.deleteMany({ where: { siswaId: id } }),
        prisma.ranking.deleteMany({ where: { siswaId: id } }),
    ]);

    const siswa = await prisma.siswa.delete({
        where: { id },
    });

    return siswa;
};

export const getSiswaByTahunAjaran = async (tahunAjaranId) => {
    const siswas = await prisma.siswa.findMany({
        where: { tahunAjaranId },
        include: {
            kelas: true,
            tahunAjaran: true,
            nilaiRekap: {
                include: { pelajaran: true },
            },
            nilaiEskulRekap: {
                include: { eskul: true },
            },
            nilaiKriteria: {
                include: { kriteria: true },
            },
        },
    });
    return siswas;
};

export const getSiswaByTahunAjaranAndKelas = async ({ tahunAjaranId, kelasId }) => {
    const siswas = await prisma.siswa.findMany({
        where: { tahunAjaranId, kelasId },
        include: {
            kelas: true,
            tahunAjaran: true,
            nilaiRekap: {
                include: { pelajaran: true },
            },
            absenRekap: {
                include: { pelajaran: true },
            },
            nilaiEskulRekap: {
                include: { eskul: true },
            },
            nilaiKriteria: {
                include: { kriteria: true },
            },
        },
    });
    return siswas;
};

export const getSiswaByEskul = async ({ tahunAjaranId, eskulId }) => {
    // query ke nilaiEskulRekap karena field eskulId sudah tidak ada langsung di Siswa
    const rekaps = await prisma.nilaiEskulRekap.findMany({
        where: { eskulId, tahunAjaranId },
        include: {
            siswa: {
                include: {
                    kelas: {
                        select: { kodeKelas: true },
                    },
                },
            },
            eskul: true,
        },
    });

    return rekaps.map((r) => ({
        ...r.siswa,
        nilaiEskulRekap: r,
    }));
};
