import prisma from '../config/prisma.js';

export const addKehadiran = async ({
    siswaId,
    kelasId,
    tahunAjaranId,
    statusKehadiran,
    tanggalKehadiran,
    pertemuanId,
}) => {
    // cek field
    if (!siswaId) {
        throw new Error('Siswa wajib di pilih');
    }
    if (!tahunAjaranId) {
        throw new Error('Tahun ajaran wajib di isi');
    }
    if (!pertemuanId) {
        throw new Error('Pertemuan wajib di pilih');
    }

    const tanggal = new Date(tanggalKehadiran);

    // karena udah pake unique jadi try catch aja
    try {
        return await prisma.kehadiran.create({
            data: {
                siswaId,
                tahunAjaranId,
                kelasId,
                statusKehadiran,
                tanggalKehadiran: tanggal,
                pertemuanId,
            },
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('Kehadiran di tanggal ini sudah ada');
        }
        throw error;
    }
};

export const updateKehadiran = async ({ pertemuanId, kelasId, siswaId, statusKehadiran }) => {
    const kehadirans = await prisma.kehadiran.updateMany({
        where: {
            kelasId,
            pertemuanId,
            siswaId,
        },
        data: {
            statusKehadiran,
            tanggalKehadiran: new Date(),
        },
    });

    return kehadirans;
};

export const getAllKehadiran = async ({ tahunAjaranId, kelasId, tanggal, pertemuanId } = {}) => {
    const where = {};

    if (tahunAjaranId) where.tahunAjaranId = tahunAjaranId;
    if (kelasId) where.kelasId = kelasId;
    if (pertemuanId) where.pertemuanId = pertemuanId;
    if (tanggal) {
        const start = new Date(`${tanggal}T00:00:00.000+07:00`);
        const end = new Date(`${tanggal}T23:59:59.999+07:00`);
        where.tanggalKehadiran = { gte: start, lte: end };
    }

    const [kehadirans, rekap] = await Promise.all([
        prisma.kehadiran.findMany({
            where,
            select: {
                id: true,
                tahunAjaran: true,
                statusKehadiran: true,
                tanggalKehadiran: true,
                siswa: {
                    select: {
                        namaSiswa: true,
                        kelas: true,
                    },
                },
            },
            orderBy: { tanggalKehadiran: 'desc' },
        }),

        prisma.kehadiran.groupBy({
            by: ['statusKehadiran'],
            where,
            _count: { statusKehadiran: true },
        }),
    ]);

    const summary = {
        total: kehadirans.length,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
    };

    rekap.forEach((item) => {
        const status = item.statusKehadiran.toLowerCase();
        if (summary[status] !== undefined) {
            summary[status] = item._count.statusKehadiran;
        }
    });

    return { data: kehadirans, summary };
};

export const getKehadiranRekap = async ({ siswaId, tahunAjaran, kelas }) => {
    const kehadirans = await prisma.kehadiran.findMany({
        where: {
            ...(siswaId && { siswaId }),
            ...(tahunAjaran && { tahunAjaran }),
            ...(kelas && { siswa: { kelas } }),
        },
        include: {
            siswa: {
                select: {
                    namaSiswa: true,
                    kelas: true,
                },
            },
        },
        orderBy: {
            tanggalKehadiran: 'desc',
        },
    });

    return kehadirans;
};

export const getOneKehadiran = async (id) => {
    const kehadirans = await prisma.kehadiran.findUnique({
        where: { id },
        select: {
            id: true,
            tahunAjaran: true,
            statusKehadiran: true,
            tanggalKehadiran: true,
            siswa: {
                select: {
                    namaSiswa: true,
                    kelas: true,
                },
            },
        },
    });

    return kehadirans;
};

export const getKehadiranByPertemuan = async ({ tahunAjaranId, kelasId, pertemuanId }) => {
    const kehadirans = await prisma.kehadiran.findMany({
        where: {
            tahunAjaranId,
            pertemuanId,
            kelasId,
        },
        include: {
            siswa: true,
            kelas: true,
            tahunAjaran: true,
        },
    });

    return kehadirans;
};

export const getKehadiranByKelasAndTanggal = async ({ kelasId, tahunAjaranId, tanggal }) => {
    const start = new Date(tanggal);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tanggal);
    end.setHours(23, 59, 59, 999);

    const siswaList = await prisma.siswa.findMany({
        where: { kelasId, tahunAjaranId },
        select: { id: true, namaSiswa: true, nis: true },
        orderBy: { namaSiswa: 'asc' },
    });

    // Kehadiran yang sudah tersimpan di tanggal itu
    const kehadiranTersimpan = await prisma.kehadiran.findMany({
        where: {
            kelasId,
            tahunAjaranId,
            tanggalKehadiran: { gte: start, lte: end },
        },
        select: { siswaId: true, statusKehadiran: true },
    });

    const statusMap = Object.fromEntries(kehadiranTersimpan.map((k) => [k.siswaId, k.statusKehadiran]));

    return siswaList.map((siswa) => ({
        ...siswa,
        statusKehadiran: statusMap[siswa.id] ?? 'Alpha',
    }));
};

export const inputKehadiranKelas = async ({ kelasId, tahunAjaranId, tanggal, kehadiran }) => {
    const [year, month, day] = tanggal.split('-').map(Number);
    const tanggalDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    let pertemuan = await prisma.pertemuan.findFirst({
        where: { kelasId, tanggal: tanggalDate },
    });

    if (!pertemuan) {
        const dayPadded = String(day).padStart(2, '0');
        const monthPadded = String(month).padStart(2, '0');
        pertemuan = await prisma.pertemuan.create({
            data: {
                kelasId,
                tahunAjaranId,
                tanggal: tanggalDate,
                namaPertemuan: `Kehadiran ${dayPadded}/${monthPadded}/${year}`,
            },
        });
    }

    const results = await Promise.all(
        kehadiran.map(({ siswaId, statusKehadiran }) =>
            prisma.kehadiran.upsert({
                where: {
                    siswaId_pertemuanId: { siswaId, pertemuanId: pertemuan.id },
                },
                update: { statusKehadiran, tanggalKehadiran: tanggalDate },
                create: {
                    siswaId,
                    kelasId,
                    tahunAjaranId,
                    pertemuanId: pertemuan.id,
                    statusKehadiran,
                    tanggalKehadiran: tanggalDate,
                },
            }),
        ),
    );

    return results;
};

export const inputKehadiranByPelajaranAndKelas = async ({
    kelasId,
    tahunAjaranId,
    tanggal,
    siswaId,
    statusKehadiran,
    pelajaranId,
}) => {
    const [year, month, day] = tanggal.split('-').map(Number);
    const tanggalDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    let pertemuan = await prisma.pertemuan.findFirst({
        where: { kelasId, tanggal: tanggalDate },
    });

    if (!pertemuan) {
        const dayPadded = String(day).padStart(2, '0');
        const monthPadded = String(month).padStart(2, '0');
        pertemuan = await prisma.pertemuan.create({
            data: {
                kelasId,
                tahunAjaranId,
                tanggal: tanggalDate,
                namaPertemuan: `Kehadiran ${dayPadded}/${monthPadded}/${year}`,
            },
        });
    }

    const result = await prisma.kehadiran.upsert({
        where: {
            siswaId_pertemuanId: { siswaId, pertemuanId: pertemuan.id },
        },
        update: { statusKehadiran, tanggalKehadiran: tanggalDate },
        create: {
            siswaId,
            kelasId,
            tahunAjaranId,
            pertemuanId: pertemuan.id,
            statusKehadiran,
            tanggalKehadiran: tanggalDate,
            pelajaranId,
        },
    });

    return result;
};

export const getKehadiranByKelasAndPelajaran = async ({ kelasId, pelajaranId, tahunAjaranId }) => {
    const kehadirans = await prisma.kehadiran.findMany({
        where: {
            kelasId,
            pelajaranId,
            tahunAjaranId,
        },
        select: {
            id: true,
            siswaId: true,
            kelasId: true,
            statusKehadiran: true,
            tanggalKehadiran: true,
            siswa: {
                select: {
                    id: true,
                    namaSiswa: true,
                    kelasId: true,
                },
            },
        },
    });
};

export const getKehadiranByJadwal = async ({ jadwalId }) => {
    const jadwal = await prisma.jadwal.findUnique({
        where: { id: jadwalId },
        select: { kelasId: true, pelajaranId: true },
    });

    if (!jadwal) throw new Error('Jadwal tidak ditemukan');

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const siswa = await prisma.siswa.findMany({
        where: {
            kelasId: jadwal.kelasId,
        },
        select: {
            id: true,
            namaSiswa: true,
            nis: true,
            kehadiran: {
                where: {
                    jadwalId,
                    tanggalKehadiran: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                select: {
                    statusKehadiran: true,
                },
                take: 1,
            },
        },
        orderBy: { namaSiswa: 'asc' },
    });

    return { jadwal, siswa };
};

export const inputKehadiranByJadwal = async ({ jadwalId, tanggal, namaPertemuan, kehadiran }) => {
    const jadwal = await prisma.jadwal.findUnique({
        where: { id: jadwalId },
        include: { kelas: { include: { tahunAjaran: true } } },
    });
    if (!jadwal) throw new Error('Jadwal tidak ditemukan');

    const { kelasId, pelajaranId, kelas } = jadwal;
    const tahunAjaranId = kelas.tahunAjaranId;

    const [year, month, day] = tanggal.split('-').map(Number);
    const tanggalDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    // Cari atau buat pertemuan
    let pertemuan = await prisma.pertemuan.findFirst({
        where: { kelasId, tanggal: tanggalDate },
    });
    if (!pertemuan) {
        let finalNamaPertemuan = namaPertemuan;
        if (!finalNamaPertemuan) {
            const [tYear, tMonth, tDay] = tanggal.split('-').map(Number);
            const dayPadded = String(tDay).padStart(2, '0');
            const monthPadded = String(tMonth).padStart(2, '0');
            finalNamaPertemuan = `Kehadiran ${dayPadded}/${monthPadded}/${tYear}`;
        }
        pertemuan = await prisma.pertemuan.create({
            data: {
                kelasId,
                tahunAjaranId,
                tanggal: tanggalDate,
                namaPertemuan: finalNamaPertemuan,
            },
        });
    }

    // Upsert kehadiran tiap siswa
    const results = await Promise.all(
        kehadiran.map(({ siswaId, statusKehadiran }) =>
            prisma.kehadiran.upsert({
                where: { siswaId_pertemuanId: { siswaId, pertemuanId: pertemuan.id } },
                update: { statusKehadiran, tanggalKehadiran: tanggalDate },
                create: {
                    siswaId,
                    kelasId,
                    tahunAjaranId,
                    pertemuanId: pertemuan.id,
                    pelajaranId,
                    jadwalId,
                    statusKehadiran,
                    tanggalKehadiran: tanggalDate,
                },
            }),
        ),
    );

    return results;
};
