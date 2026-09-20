jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        siswa: {
            findUnique: jest.fn(),
        },
        absenRekap: {
            upsert: jest.fn(),
        },
    },
}));

jest.mock('../../services/smartService.js', () => ({
    __esModule: true,
    triggerHitungSMART: jest.fn(),
}));

jest.mock('../../helper/validation.js', () => ({
    __esModule: true,
    toNonNegativeInteger: jest.fn(),
}));

import prisma from '../../config/prisma.js';
import { triggerHitungSMART } from '../../services/smartService.js';
import { toNonNegativeInteger } from '../../helper/validation.js';
import { inputAbsenRekap } from '../../services/absenRekapService.js';

describe('Absen Rekap Service', () => {
    const input = {
        siswaId: 1,
        pelajaranId: 3,
        totalPertemuan: 10,
        totalHadir: 7,
        totalSakit: 1,
        totalIzin: 1,
        totalAlpha: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        toNonNegativeInteger.mockImplementation((value) => Number(value));
    });

    it('Input absen rekap (Siswa tidak ditemukan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue(null);

        await expect(inputAbsenRekap(input)).rejects.toThrow('Siswa tidak ditemukan');

        expect(prisma.absenRekap.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('Input absen rekap (Siswa tidak memiliki kelas)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: null, tahunAjaranId: 1 });

        await expect(inputAbsenRekap(input)).rejects.toThrow('Siswa tidak memiliki kelas');

        expect(prisma.absenRekap.upsert).not.toHaveBeenCalled();
    });

    it('Input absen rekap (Siswa tidak memiliki tahun ajaran)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 2, tahunAjaranId: null });

        await expect(inputAbsenRekap(input)).rejects.toThrow('Siswa tidak memiliki tahun ajaran');

        expect(prisma.absenRekap.upsert).not.toHaveBeenCalled();
    });

    it('Input absen rekap (Angka tidak valid)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 2, tahunAjaranId: 1 });
        toNonNegativeInteger.mockImplementation(() => {
            throw new Error('Total pertemuan harus berupa bilangan bulat non-negatif');
        });

        await expect(inputAbsenRekap({ ...input, totalPertemuan: -1 })).rejects.toThrow(
            'Total pertemuan harus berupa bilangan bulat non-negatif',
        );

        expect(prisma.absenRekap.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('Input absen rekap (Jumlah melebihi total pertemuan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 2, tahunAjaranId: 1 });

        await expect(
            inputAbsenRekap({
                ...input,
                totalPertemuan: 10,
                totalHadir: 8,
                totalSakit: 2,
                totalIzin: 1,
                totalAlpha: 0,
            }),
        ).rejects.toThrow('Jumlah hadir, sakit, izin, dan alpha tidak boleh melebihi total pertemuan');

        expect(prisma.absenRekap.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('Input absen rekap (Berhasil)', async () => {
        const saved = { id: 1, siswaId: 1, pelajaranId: 3, tahunAjaranId: 4, kelasId: 2, ...input };

        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 2, tahunAjaranId: 4 });
        prisma.absenRekap.upsert.mockResolvedValue(saved);

        const result = await inputAbsenRekap(input);

        // kelima angka divalidasi dengan label yang benar
        expect(toNonNegativeInteger).toHaveBeenCalledWith(10, 'Total pertemuan');
        expect(toNonNegativeInteger).toHaveBeenCalledWith(7, 'Total hadir');
        expect(toNonNegativeInteger).toHaveBeenCalledWith(1, 'Total sakit');
        expect(toNonNegativeInteger).toHaveBeenCalledWith(1, 'Total izin');
        expect(toNonNegativeInteger).toHaveBeenCalledWith(1, 'Total alpha');

        expect(prisma.absenRekap.upsert).toHaveBeenCalledWith({
            where: {
                siswaId_pelajaranId_tahunAjaranId: {
                    siswaId: 1,
                    pelajaranId: 3,
                    tahunAjaranId: 4,
                },
            },
            update: {
                totalPertemuan: 10,
                totalHadir: 7,
                totalSakit: 1,
                totalIzin: 1,
                totalAlpha: 1,
            },
            create: {
                siswaId: 1,
                pelajaranId: 3,
                tahunAjaranId: 4,
                kelasId: 2,
                totalPertemuan: 10,
                totalHadir: 7,
                totalSakit: 1,
                totalIzin: 1,
                totalAlpha: 1,
            },
        });
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 1 });
        expect(result).toEqual(saved);
    });

    it('Input absen rekap (Berhasil, jumlah tepat sama dengan total pertemuan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 2, tahunAjaranId: 4 });
        prisma.absenRekap.upsert.mockResolvedValue({ id: 1 });

        await expect(inputAbsenRekap(input)).resolves.toEqual({ id: 1 });
    });

    it('Input absen rekap (Berhasil, jumlah kurang dari total pertemuan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 2, tahunAjaranId: 4 });
        prisma.absenRekap.upsert.mockResolvedValue({ id: 1 });

        await inputAbsenRekap({
            ...input,
            totalPertemuan: 10,
            totalHadir: 5,
            totalSakit: 0,
            totalIzin: 0,
            totalAlpha: 0,
        });

        expect(prisma.absenRekap.upsert).toHaveBeenCalledTimes(1);
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 1 });
    });
});
