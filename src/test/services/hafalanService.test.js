jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        siswa: {
            findUnique: jest.fn(),
        },
        hafalan: {
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

jest.mock('../../helper/nilaiKeterangan.js', () => ({
    __esModule: true,
    getKeteranganHafalan: jest.fn(),
}));

import prisma from '../../config/prisma.js';
import { triggerHitungSMART } from '../../services/smartService.js';
import { toNonNegativeInteger } from '../../helper/validation.js';
import { getKeteranganHafalan } from '../../helper/nilaiKeterangan.js';
import { inputHafalan } from '../../services/hafalanService.js';

describe('Hafalan Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        toNonNegativeInteger.mockImplementation((value) => Number(value));
        getKeteranganHafalan.mockImplementation((juz) => `Keterangan ${juz} juz`);
    });

    it('Input hafalan (Siswa tidak ditemukan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue(null);

        await expect(inputHafalan({ siswaId: 99, jumlahJuz: 5 })).rejects.toThrow('Siswa tidak ditemukan');

        expect(prisma.siswa.findUnique).toHaveBeenCalledWith({ where: { id: 99 } });
        expect(prisma.hafalan.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('Input hafalan (Jumlah juz tidak valid)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ id: 1 });
        toNonNegativeInteger.mockImplementation(() => {
            throw new Error('Jumlah juz harus berupa bilangan bulat non-negatif');
        });

        await expect(inputHafalan({ siswaId: 1, jumlahJuz: -3 })).rejects.toThrow(
            'Jumlah juz harus berupa bilangan bulat non-negatif',
        );

        expect(toNonNegativeInteger).toHaveBeenCalledWith(-3, 'Jumlah juz');
        expect(prisma.hafalan.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('Input hafalan (Jumlah juz lebih dari 30)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ id: 1 });

        await expect(inputHafalan({ siswaId: 1, jumlahJuz: 31 })).rejects.toThrow(
            'Jumlah juz tidak boleh lebih dari 30',
        );

        expect(getKeteranganHafalan).not.toHaveBeenCalled();
        expect(prisma.hafalan.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('Input hafalan (Berhasil)', async () => {
        const saved = { id: 1, siswaId: 1, jumlahJuz: 5, keterangan: 'Keterangan 5 juz' };

        prisma.siswa.findUnique.mockResolvedValue({ id: 1 });
        prisma.hafalan.upsert.mockResolvedValue(saved);

        const result = await inputHafalan({ siswaId: 1, jumlahJuz: 5 });

        expect(toNonNegativeInteger).toHaveBeenCalledWith(5, 'Jumlah juz');
        expect(getKeteranganHafalan).toHaveBeenCalledWith(5);
        expect(prisma.hafalan.upsert).toHaveBeenCalledWith({
            where: { siswaId: 1 },
            update: { jumlahJuz: 5, keterangan: 'Keterangan 5 juz' },
            create: { siswaId: 1, jumlahJuz: 5, keterangan: 'Keterangan 5 juz' },
        });
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 1 });
        expect(result).toEqual(saved);
    });

    it.each([
        ['batas bawah', 0],
        ['batas atas', 30],
    ])('Input hafalan (Berhasil, %s: %i juz)', async (_label, juz) => {
        prisma.siswa.findUnique.mockResolvedValue({ id: 1 });
        prisma.hafalan.upsert.mockResolvedValue({ id: 1, siswaId: 1, jumlahJuz: juz });

        await inputHafalan({ siswaId: 1, jumlahJuz: juz });

        // > 30 tolak
        expect(prisma.hafalan.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { siswaId: 1 },
                update: expect.objectContaining({ jumlahJuz: juz }),
                create: expect.objectContaining({ siswaId: 1, jumlahJuz: juz }),
            }),
        );
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 1 });
    });
});
