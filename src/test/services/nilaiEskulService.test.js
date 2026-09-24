jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        siswa: {
            findUnique: jest.fn(),
        },
        nilaiEskulRekap: {
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
    toScore: jest.fn(),
}));

jest.mock('../../helper/nilaiKeterangan.js', () => ({
    __esModule: true,
    getKeterangan: jest.fn(),
}));

import prisma from '../../config/prisma.js';
import { triggerHitungSMART } from '../../services/smartService.js';
import { toNonNegativeInteger, toScore } from '../../helper/validation.js';
import { getKeterangan } from '../../helper/nilaiKeterangan.js';
import { inputNilaiEskul } from '../../services/nilaiEskulService.js';

describe('Nilai Eskul Service - inputNilaiEskul (white box, V(G) = 5)', () => {
    const baseInput = {
        siswaId: 1,
        eskulId: 2,
        nilaiPerforma: 80,
        totalHadir: 8,
        totalIzin: 1,
        totalSakit: 1,
        totalAlpha: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        toScore.mockImplementation((value) => Number(value));
        toNonNegativeInteger.mockImplementation((value) => Number(value));
        getKeterangan.mockImplementation((nilai) => `Keterangan ${nilai}`);
    });

    it('siswa tidak ditemukan', async () => {
        prisma.siswa.findUnique.mockResolvedValue(null);

        await expect(inputNilaiEskul(baseInput)).rejects.toThrow('Siswa tidak ditemukan');

        expect(prisma.siswa.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { kelasId: true, tahunAjaranId: true },
        });
        expect(toScore).not.toHaveBeenCalled();
        expect(prisma.nilaiEskulRekap.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it(' siswa tidak memiliki kelas', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: null, tahunAjaranId: 3 });

        await expect(inputNilaiEskul(baseInput)).rejects.toThrow('Siswa tidak memiliki kelas');

        expect(toScore).not.toHaveBeenCalled();
        expect(prisma.nilaiEskulRekap.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('TC-03 (P3): siswa tidak memiliki tahun ajaran', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 5, tahunAjaranId: null });

        await expect(inputNilaiEskul(baseInput)).rejects.toThrow('Siswa tidak memiliki tahun ajaran');

        expect(toScore).not.toHaveBeenCalled();
        expect(prisma.nilaiEskulRekap.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('TC-04 (P4): berhasil, total pertemuan 0 sehingga nilai kehadiran 0', async () => {
        const saved = { id: 1, siswaId: 1, eskulId: 2, nilaiAkhir: 48 };
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 5, tahunAjaranId: 3 });
        prisma.nilaiEskulRekap.upsert.mockResolvedValue(saved);

        const result = await inputNilaiEskul({
            ...baseInput,
            totalHadir: 0,
            totalIzin: 0,
            totalSakit: 0,
            totalAlpha: 0,
        });

        expect(getKeterangan).toHaveBeenCalledWith(48);
        expect(prisma.nilaiEskulRekap.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: expect.objectContaining({
                    nilaiAkhir: 48,
                    totalPertemuan: 0,
                    keterangan: 'Keterangan 48',
                }),
                create: expect.objectContaining({ nilaiAkhir: 48, totalPertemuan: 0 }),
            }),
        );
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 1 });
        expect(result).toEqual(saved);
    });

    it('TC-05 (P5): berhasil, total pertemuan > 0', async () => {
        const saved = { id: 1, siswaId: 1, eskulId: 2, nilaiAkhir: 84 };
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 5, tahunAjaranId: 3 });
        prisma.nilaiEskulRekap.upsert.mockResolvedValue(saved);

        const result = await inputNilaiEskul(baseInput);

        expect(toScore).toHaveBeenCalledWith(80, 'Nilai performa');
        expect(toNonNegativeInteger).toHaveBeenCalledWith(8, 'Total hadir');
        expect(getKeterangan).toHaveBeenCalledWith(84);
        expect(prisma.nilaiEskulRekap.upsert).toHaveBeenCalledWith({
            where: {
                siswaId_eskulId_tahunAjaranId: { siswaId: 1, eskulId: 2, tahunAjaranId: 3 },
            },
            update: {
                nilaiAkhir: 84,
                totalPertemuan: 10,
                totalHadir: 8,
                totalIzin: 1,
                totalAlpha: 0,
                totalSakit: 1,
                nilaiPerforma: 80,
                keterangan: 'Keterangan 84',
            },
            create: {
                siswaId: 1,
                eskulId: 2,
                tahunAjaranId: 3,
                kelasId: 5,
                nilaiAkhir: 84,
                nilaiPerforma: 80,
                totalPertemuan: 10,
                totalHadir: 8,
                totalIzin: 1,
                totalSakit: 1,
                totalAlpha: 0,
                keterangan: 'Keterangan 84',
            },
        });
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 1 });
        expect(result).toEqual(saved);
    });

    it('Tambahan: nilai performa tidak valid, upsert tidak dipanggil', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 5, tahunAjaranId: 3 });
        toScore.mockImplementation(() => {
            throw new Error('Nilai performa tidak valid');
        });

        await expect(inputNilaiEskul({ ...baseInput, nilaiPerforma: 150 })).rejects.toThrow(
            'Nilai performa tidak valid',
        );

        expect(prisma.nilaiEskulRekap.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('Tambahan: total hadir negatif, upsert tidak dipanggil', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ kelasId: 5, tahunAjaranId: 3 });
        toNonNegativeInteger.mockImplementation(() => {
            throw new Error('Total hadir harus berupa bilangan bulat non-negatif');
        });

        await expect(inputNilaiEskul({ ...baseInput, totalHadir: -1 })).rejects.toThrow(
            'Total hadir harus berupa bilangan bulat non-negatif',
        );

        expect(prisma.nilaiEskulRekap.upsert).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });
});
