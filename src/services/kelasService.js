import prisma from '../config/prisma.js';

export const addKelas = async ({ kodeKelas, namaKelas, tahunAjaranId, kelasIndukId }) => {
    if (!kodeKelas?.trim()) {
        throw new Error('Nama kelas wajib di isi');
    }
    if (!namaKelas?.trim()) {
        throw new Error('Nama kelas wajib di isi');
    }
    if (!tahunAjaranId) {
        throw new Error('Tahun Ajaran Wajib Di Isi');
    }
    if (!kelasIndukId) {
        throw new Error(' Kelas Induk Wajib Di Isi');
    }

    const existingKelas = await prisma.kelas.findFirst({
        where: {
            kodeKelas,
            tahunAjaranId,
            kelasIndukId,
        },
    });

    if (existingKelas) throw new Error('Data sudah ada');

    const newKelas = await prisma.kelas.create({
        data: {
            kodeKelas: kodeKelas,
            namaKelas: namaKelas,
            tahunAjaranId,
            kelasIndukId,
        },
    });

    return newKelas;
};

export const updateKelas = async (id, { kodeKelas, namaKelas, kelasIndukId }) => {
    const existingKelas = await prisma.kelas.findUnique({
        where: { id },
    });

    if (!existingKelas) throw new Error('Kelas tidak ditemukan');

    // Tentukan nilai final (pakai input baru kalau ada, kalau tidak pakai data lama)
    const finalKodeKelas = kodeKelas ?? existingKelas.kodeKelas;
    const finalNamaKelas = namaKelas ?? existingKelas.namaKelas;
    const finalKelasIndukId = kelasIndukId ?? existingKelas.kelasIndukId;

    // Cek duplikat berdasarkan kombinasi final
    const duplicate = await prisma.kelas.findFirst({
        where: {
            kodeKelas: finalKodeKelas,
            namaKelas: finalNamaKelas,
            kelasIndukId: finalKelasIndukId,
            tahunAjaranId: existingKelas.tahunAjaranId,
            NOT: { id },
        },
    });

    if (duplicate) throw new Error('Kelas dengan kode, nama, dan kelas induk yang sama sudah ada');

    const data = {};
    if (namaKelas) data.namaKelas = namaKelas;
    if (kodeKelas) data.kodeKelas = kodeKelas;
    if (kelasIndukId) data.kelasIndukId = kelasIndukId;

    const updatedKelas = await prisma.kelas.update({
        where: { id },
        data,
    });

    return updatedKelas;
};

export const getKelas = async () => {
    const kelas = await prisma.kelas.findMany({
        select: {
            id: true,
            kodeKelas: true,
            namaKelas: true,
            tahunAjaranId: true,
            kelasIndukId: true,
        },
    });
    return kelas;
};

export const getOneKelas = async (id) => {
    const kelas = await prisma.kelas.findUnique({
        where: { id },
        select: {
            id: true,
            kodeKelas: true,
            namaKelas: true,
            kelasIndukId: true,
            waliKelas: {
                select: {
                    email: true,
                    username: true,
                    telephone: true,
                    pelajaran: {
                        include: { pelajaran: true },
                    },
                },
            },
        },
    });

    return kelas;
};

export const deleteKelas = async (id) => {
    // ambil semua siswa di kelas ini
    const siswaList = await prisma.siswa.findMany({ where: { kelasId: id }, select: { id: true } });
    const siswaIds = siswaList.map((s) => s.id);

    if (siswaIds.length > 0) {
        await prisma.nilaiKriteria.deleteMany({ where: { siswaId: { in: siswaIds } } });
        await prisma.ranking.deleteMany({ where: { siswaId: { in: siswaIds } } });
        await prisma.poinPlus.deleteMany({ where: { siswaId: { in: siswaIds } } });
        await prisma.poinMinus.deleteMany({ where: { siswaId: { in: siswaIds } } });
        await prisma.hafalan.deleteMany({ where: { siswaId: { in: siswaIds } } });
    }

    // hapus rekap yang mengacu ke kelas ini
    await prisma.nilaiRekap.deleteMany({ where: { kelasId: id } });
    await prisma.absenRekap.deleteMany({ where: { kelasId: id } });
    await prisma.nilaiEskulRekap.deleteMany({ where: { kelasId: id } });

    await prisma.siswa.updateMany({ where: { kelasId: id }, data: { kelasId: null } });

    const removeKelas = await prisma.kelas.delete({ where: { id } });
    return removeKelas;
};

export const getKelasByTahunAjaran = async (tahunAjaranId) => {
    const kelas = await prisma.kelas.findMany({
        where: { tahunAjaranId },
        select: {
            id: true,
            kodeKelas: true,
            namaKelas: true,
            kelasInduk: {
                select: {
                    id: true,
                    namaKelasInduk: true,
                },
            },
        },
    });
    return kelas;
};
