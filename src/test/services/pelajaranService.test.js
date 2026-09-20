jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        pelajaran: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        siswa: {
            findMany: jest.fn(),
        },
    },
}));

import prisma from '../../config/prisma.js';
import { addPelajaran, updatePelajaran, deletePelajaran } from '../../services/pelajaranService.js';

describe('Pelajaran Service', () => {
    beforeEach(() => jest.clearAllMocks());

    it('Menambahkan daftar pelajaran (Data Sudah Ada)', async () => {
        prisma.pelajaran.findFirst.mockResolvedValue({
            id: 1,
            namaPelajaran: 'Bahasa Inggris',
            kodePelajaran: 'BASING',
        });
        await expect(
            addPelajaran({
                namaPelajaran: 'Bahasa Inggris',
                kodePelajaran: 'BASING',
            }),
        ).rejects.toThrow('Data sudah ada');

        expect(prisma.pelajaran.create).not.toHaveBeenCalled();
    });

    it('Menambah data pelajaran (Berhasil)', async () => {
        const create = {
            id: 1,
            namaPelajaran: 'Bahasa Inggris',
            kodePelajaran: 'BASING',
        };
        prisma.pelajaran.findFirst.mockResolvedValue(null);
        prisma.pelajaran.create.mockResolvedValue(create);
        prisma.siswa.findMany.mockResolvedValue([]);

        const result = await addPelajaran({ id: 1, namaPelajaran: 'Bahasa Inggris', kodePelajaran: 'BASING' });

        expect(result).toEqual(create);
    });

    it('Mengedit data pelajaran (berhasil)', async () => {
        const existing = { id: 1, namaPelajaran: 'Bahasa Arab', kodePelajaran: 'BARAB' };
        const updated = { id: 1, namaPelajaran: 'Bahasa Inggris', kodePelajaran: 'BASING' };

        prisma.pelajaran.findUnique.mockResolvedValue(existing);
        prisma.pelajaran.findFirst.mockResolvedValue(null);
        prisma.pelajaran.update.mockResolvedValue(updated);
        await updatePelajaran(1, { namaPelajaran: 'Bahasa Inggris', kodePelajaran: 'BASING' });

        expect(prisma.pelajaran.update).toHaveBeenCalledTimes(1);
        expect(prisma.pelajaran.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 1 },
            }),
        );
    });

    it('Mengedit data pelajaran (Data tidak ada)', async () => {
        prisma.pelajaran.findUnique.mockResolvedValue(null);

        await expect(updatePelajaran(1, { namaPelajaran: 'Bahasa Indonesia' })).rejects.toThrow(
            'Pelajaran tidak di temukan',
        );

        expect(prisma.pelajaran.update).not.toHaveBeenCalled();
    });

    it('Mengedit data pelajaran (nama atau kode sudah ada)', async () => {
        const existing = { id: 1, namaPelajaran: 'Bahasa Arab', kodePelajaran: 'BARAB' };
        const duplicate = { id: 2, namaPelajaran: 'Bahasa Inggris', kodePelajaran: 'BASING' };

        prisma.pelajaran.findUnique.mockResolvedValue(existing);
        prisma.pelajaran.findFirst.mockResolvedValue(duplicate);

        await expect(updatePelajaran(1, { namaPelajaran: 'Bahasa Inggris', kodePelajaran: 'BASING' })).rejects.toThrow(
            'nama atau kode sudah digunakan',
        );

        expect(prisma.pelajaran.update).not.toHaveBeenCalled();
    });

    it('Delete data pelajaran (Tidak ditemukan)', async () => {
        prisma.pelajaran.findUnique.mockResolvedValue(null); // data tidak ada

        await expect(deletePelajaran(3)).rejects.toThrow('Data tidak ditemukan');

        expect(prisma.pelajaran.delete).not.toHaveBeenCalled();
    });

    it('Delete data pelajaran (Berhasil)', async () => {
        const fakePelajaran = {
            id: 1,
            namaPelajaran: 'Bahasa Inggris',
            kodePelajaran: 'BASING',
        };

        prisma.pelajaran.findUnique.mockResolvedValue(fakePelajaran);
        prisma.pelajaran.delete.mockResolvedValue(fakePelajaran);

        const result = await deletePelajaran(1);

        expect(prisma.pelajaran.delete).toHaveBeenCalledTimes(1);
        expect(prisma.pelajaran.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(fakePelajaran);
    });
});
