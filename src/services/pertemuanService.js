import prisma from '../config/prisma.js';

export const addPertemuan = async ({ tahunAjaranId, tanggal, kelasId, namaPertemuan }) => {
    if (!tahunAjaranId) throw new Error('Tahun Ajaran Wajib Di Pilih');
    if (!namaPertemuan) throw new Error('Nama Pertemuan Wajib Di Isi');
    if (!tanggal) throw new Error('Tanggal Wajib Di Isi');
    if (!kelasId) throw new Error('Wajib Pilih Kelas');

    const existingPertemuan = await prisma.pertemuan.findFirst({
        where: { namaPertemuan, tahunAjaranId, kelasId },
    });

    if (existingPertemuan) throw new Error('Nama Pertemuan Sudah Ada');

    const newPertemuan = await prisma.pertemuan.create({
        data: {
            tanggal: new Date(tanggal),
            kelas: { connect: { id: kelasId } },
            namaPertemuan,
            tahunAjaran: { connect: { id: tahunAjaranId } },
        },
    });

    // ambil semua siswa di kelas dan tahun ajaran yang sama
    const siswaDiKelas = await prisma.siswa.findMany({
        where: { kelasId, tahunAjaranId },
    });

    // generate kehadiran Alpha untuk semua siswa yang sudah ada
    if (siswaDiKelas.length > 0) {
        await prisma.kehadiran.createMany({
            data: siswaDiKelas.map((siswa) => ({
                siswaId: siswa.id,
                pertemuanId: newPertemuan.id,
                kelasId,
                tahunAjaranId,
                statusKehadiran: 'Alpha',
                tanggalKehadiran: new Date(tanggal),
            })),
            skipDuplicates: true,
        });
    }

    return newPertemuan;
};

export const updatePertemuan = async (id, { tahunAjaranId, tanggal, kelasId, namaPertemuan }) => {
    const existingPertemuan = await prisma.pertemuan.findUnique({
        where: { id },
    });

    if (!existingPertemuan) throw new Error('Pertemuan Tidak ditemukan');

    if (namaPertemuan) {
        const existing = await prisma.pertemuan.findFirst({
            where: {
                namaPertemuan,
                tahunAjaranId: tahunAjaranId || existingPertemuan.tahunAjaranId,
                kelasId: kelasId || existingPertemuan.kelasId,
                NOT: { id },
            },
        });
        if (existing) {
            throw new Error('Nama pertemuan sudah digunakan');
        }
    }

    const data = {};
    if (tahunAjaranId) {
        data.tahunAjaranId = tahunAjaranId;
    }
    if (tanggal) {
        data.tanggal = new Date(tanggal);
    }
    if (kelasId) {
        data.kelasId = kelasId;
    }
    if (namaPertemuan) {
        data.namaPertemuan = namaPertemuan;
    }

    const updatedPertemuan = await prisma.pertemuan.update({
        where: { id },
        data,
        include: {
            tahunAjaran: true,
            kelas: true,
        },
    });

    return updatedPertemuan;
};

export const getAllPertemuan = async () => {
    const pertemuans = await prisma.pertemuan.findMany({
        include: {
            tahunAjaran: true,
            kelas: true,
        },
    });

    return pertemuans;
};

export const getOnePertemuan = async (id) => {
    const pertemuans = await prisma.pertemuan.findUnique({
        where: { id },
        include: {
            tahunAjaran: true,
            kelas: true,
        },
    });

    return pertemuans;
};

export const deletePertemuan = async (id) => {
    await prisma.kehadiran.deleteMany({
        where: { pertemuanId: id },
    });
    const pertemuans = await prisma.pertemuan.delete({ where: { id } });
    return pertemuans;
};

export const getPertemuanByTahunAjaranAndKelas = async (tahunAjaranId, kelasId) => {
    const pertemuans = await prisma.pertemuan.findMany({
        where: { tahunAjaranId, kelasId },
        include: { tahunAjaran: true, kelas: true },
        orderBy: { tanggal: `asc` },
    });

    return pertemuans.map((p, index) => ({
        ...p,
        nomorUrut: index + 1,
    }));

    return pertemuans;
};
