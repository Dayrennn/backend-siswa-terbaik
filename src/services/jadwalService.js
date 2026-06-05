import prisma from '../config/prisma.js';
import { timeToMinutes, minutesToTime } from '../helper/timeHelper.js';

export const addJadwal = async ({ pelajaranId, hari, jamMulai, jamSelesai, kelasId }) => {
    const mulai = timeToMinutes(jamMulai);
    const selesai = timeToMinutes(jamSelesai);

    const existingJadwal = await prisma.jadwal.findFirst({
        where: {
            hari,
            kelasId,
            OR: [
                { jamMulai: { lte: mulai }, jamSelesai: { gt: mulai } },
                { jamMulai: { lt: selesai }, jamSelesai: { gte: selesai } },
                { jamMulai: { gte: mulai }, jamSelesai: { lte: selesai } },
            ],
        },
    });

    if (existingJadwal) {
        throw new Error(
            `Jadwal bentrok pada hari ${hari} jam ${minutesToTime(existingJadwal.jamMulai)} - ${minutesToTime(existingJadwal.jamSelesai)}`,
        );
    }

    return await prisma.jadwal.create({
        data: { pelajaranId, kelasId, hari, jamMulai: mulai, jamSelesai: selesai },
    });
};

export const updateJadwal = async (id, { pelajaranId, hari, jamMulai, jamSelesai, kelasId }) => {
    const mulai = timeToMinutes(jamMulai);
    const selesai = timeToMinutes(jamSelesai);

    const jadwal = await prisma.jadwal.findUnique({
        where: { id },
    });

    if (!jadwal) {
        throw new Error('Jadwal tidak ditemukan');
    }

    const updateData = {};
    if (pelajaranId) updateData.pelajaranId = pelajaranId;
    if (kelasId) updateData.kelasId = kelasId;
    if (hari) updateData.hari = hari;
    if (jamMulai) updateData.jamMulai = mulai;
    if (jamSelesai) updateData.jamSelesai = selesai;

    const update = await prisma.jadwal.update({
        where: { id },
        data: updateData,
    });

    return update;
};

export const getJadwalByKelasAndTahunAjaran = async ({ kelasId, tahunAjaranId }) => {
    const jadwal = await prisma.jadwal.findMany({
        where: { kelasId, kelas: { tahunAjaranId } },
        select: {
            id: true,
            hari: true,
            jamMulai: true,
            jamSelesai: true,
            kelas: {
                select: {
                    id: true,
                    namaKelas: true,
                    kodeKelas: true,
                    tahunAjaranId: true,
                },
            },
            pelajaran: {
                select: {
                    id: true,
                    namaPelajaran: true,
                    kodePelajaran: true,
                },
            },
        },
    });
    return jadwal;
};

export const deleteJadwal = async (id) => {
    const removeJadwal = await prisma.jadwal.deleteMany({
        where: { id },
    });

    return removeJadwal;
};
