jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        siswa: {
            findUnique: jest.fn(),
        },
        poinMinus: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        poinPlus: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('../../services/smartService.js', () => ({
    __esModule: true,
    triggerHitungSMART: jest.fn(),
}));

jest.mock('../../helper/validation.js', () => ({
    __esModule: true,
    toPositiveInteger: jest.fn(),
}));

import prisma from '../../config/prisma.js';
import { triggerHitungSMART } from '../../services/smartService.js';
import { toPositiveInteger } from '../../helper/validation.js';
import * as poinMinusService from '../../services/poinMinusService.js';
import * as poinPlusService from '../../services/poinPlusService.js';

const cases = [
    [
        'Poin Minus',
        'poinMinus',
        'poinPlus',
        poinMinusService.addPoin,
        poinMinusService.updatePoin,
        poinMinusService.removePoinMinus,
    ],
    [
        'Poin Plus',
        'poinPlus',
        'poinMinus',
        poinPlusService.addPoin,
        poinPlusService.updatePoin,
        poinPlusService.removePoinPlus,
    ],
];

describe.each(cases)('%s Service', (label, model, otherModel, addPoin, updatePoin, removePoin) => {
    beforeEach(() => {
        jest.clearAllMocks();
        toPositiveInteger.mockImplementation((value) => Number(value));
    });


    it('Menambah poin (Siswa Id kosong)', async () => {
        await expect(addPoin({ deskripsi: 'Terlambat', poin: 10 })).rejects.toThrow('Siswa Id Tidak Ditemukan');

        expect(prisma.siswa.findUnique).not.toHaveBeenCalled();
        expect(prisma[model].create).not.toHaveBeenCalled();
    });

    it('Menambah poin (Deskripsi kosong)', async () => {
        await expect(addPoin({ siswaId: 1, deskripsi: '   ', poin: 10 })).rejects.toThrow('Deskripsi wajib di isi');

        expect(prisma.siswa.findUnique).not.toHaveBeenCalled();
        expect(prisma[model].create).not.toHaveBeenCalled();
    });

    it('Menambah poin (Poin tidak valid)', async () => {
        toPositiveInteger.mockImplementation(() => {
            throw new Error('Poin harus berupa bilangan bulat positif');
        });

        await expect(addPoin({ siswaId: 1, deskripsi: 'Terlambat', poin: -5 })).rejects.toThrow(
            'Poin harus berupa bilangan bulat positif',
        );

        expect(toPositiveInteger).toHaveBeenCalledWith(-5, 'Poin');
        expect(prisma[model].create).not.toHaveBeenCalled();
    });

    it('Menambah poin (Siswa tidak ditemukan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue(null);

        await expect(addPoin({ siswaId: 99, deskripsi: 'Terlambat', poin: 10 })).rejects.toThrow(
            'Siswa dengan id 99 tidak ditemukan',
        );

        expect(prisma[model].create).not.toHaveBeenCalled();
        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });

    it('Menambah poin (Berhasil, tahun ajaran diambil dari siswa)', async () => {
        const created = {
            id: 1,
            siswaId: 1,
            tahunAjaranId: 5,
            deskripsi: 'Terlambat',
            poin: 10,
            tanggal: new Date('2026-01-15'),
        };

        prisma.siswa.findUnique.mockResolvedValue({ tahunAjaranId: 5 });
        prisma[model].create.mockResolvedValue(created);

        const result = await addPoin({ siswaId: 1, deskripsi: 'Terlambat', poin: 10, tanggal: '2026-01-15' });

        expect(prisma[model].create).toHaveBeenCalledWith({
            data: {
                siswaId: 1,
                tahunAjaranId: 5,
                deskripsi: 'Terlambat',
                poin: 10,
                tanggal: new Date('2026-01-15'),
            },
        });
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 1 });
        expect(prisma[otherModel].create).not.toHaveBeenCalled(); // pastikan tidak salah tabel
        expect(result).toEqual(created);
    });

    it('Menambah poin (Berhasil, tahun ajaran dikirim manual)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ tahunAjaranId: 5 });
        prisma[model].create.mockResolvedValue({ id: 1 });

        await addPoin({ siswaId: 1, tahunAjaranId: 2, deskripsi: 'Terlambat', poin: 10 });

        expect(prisma[model].create).toHaveBeenCalledWith({
            data: expect.objectContaining({ tahunAjaranId: 2 }),
        });
    });

    it('Menambah poin (Berhasil, tanggal tidak diisi -> tanggal hari ini)', async () => {
        prisma.siswa.findUnique.mockResolvedValue({ tahunAjaranId: 5 });
        prisma[model].create.mockResolvedValue({ id: 1 });

        await addPoin({ siswaId: 1, deskripsi: 'Terlambat', poin: 10 });

        expect(prisma[model].create).toHaveBeenCalledWith({
            data: expect.objectContaining({ tanggal: expect.any(Date) }),
        });
    });


    it('Mengedit poin (Id kosong)', async () => {
        await expect(updatePoin({ deskripsi: 'Terlambat', poin: 10 })).rejects.toThrow('Id Poin Tidak Ditemukan');

        expect(prisma[model].update).not.toHaveBeenCalled();
    });

    it('Mengedit poin (Deskripsi kosong)', async () => {
        await expect(updatePoin({ id: 1, deskripsi: '', poin: 10 })).rejects.toThrow('Deskripsi wajib di isi');

        expect(prisma[model].update).not.toHaveBeenCalled();
    });

    it('Mengedit poin (Poin tidak valid)', async () => {
        toPositiveInteger.mockImplementation(() => {
            throw new Error('Poin harus berupa bilangan bulat positif');
        });

        await expect(updatePoin({ id: 1, deskripsi: 'Terlambat', poin: 0 })).rejects.toThrow(
            'Poin harus berupa bilangan bulat positif',
        );

        expect(prisma[model].update).not.toHaveBeenCalled();
    });

    it('Mengedit poin (Berhasil, dengan tanggal)', async () => {
        const updated = {
            id: 1,
            siswaId: 7,
            deskripsi: 'Bolos',
            poin: 20,
            tanggal: new Date('2026-02-01'),
        };

        prisma[model].update.mockResolvedValue(updated);

        const result = await updatePoin({ id: 1, deskripsi: 'Bolos', poin: 20, tanggal: '2026-02-01' });

        expect(prisma[model].update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                deskripsi: 'Bolos',
                poin: 20,
                tanggal: new Date('2026-02-01').toISOString(),
            },
            select: {
                id: true,
                siswaId: true,
                deskripsi: true,
                poin: true,
                tanggal: true,
            },
        });
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 7 });
        expect(prisma[otherModel].update).not.toHaveBeenCalled();
        expect(result).toEqual(updated);
    });

    it('Mengedit poin (Berhasil, tanpa tanggal)', async () => {
        const updated = { id: 1, siswaId: 7, deskripsi: 'Bolos', poin: 20, tanggal: new Date() };

        prisma[model].update.mockResolvedValue(updated);

        await updatePoin({ id: 1, deskripsi: 'Bolos', poin: 20 });

        expect(prisma[model].update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { deskripsi: 'Bolos', poin: 20 },
            }),
        );
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 7 });
    });


    it('Delete poin (Berhasil)', async () => {
        const removed = { id: 1, siswaId: 7, deskripsi: 'Terlambat', poin: 10 };

        prisma[model].delete.mockResolvedValue(removed);

        const result = await removePoin(1);

        expect(prisma[model].delete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 7 });
        expect(prisma[otherModel].delete).not.toHaveBeenCalled();
        expect(result).toEqual(removed);
    });

    it('Delete poin (Tidak ditemukan)', async () => {
        // service tidak mengecek dulu, jadi error datang dari Prisma (P2025)
        prisma[model].delete.mockRejectedValue(new Error('Record to delete does not exist.'));

        await expect(removePoin(99)).rejects.toThrow('Record to delete does not exist.');

        expect(triggerHitungSMART).not.toHaveBeenCalled();
    });
});
