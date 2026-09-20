jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        tahunAjaran: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

import prisma from '../../config/prisma.js';
import {
    addTahunAjaran,
    updateTahunAjaran,
    getAllTahunAjaran,
    getOneTahunAjaran,
    deleteTahunAjaran,
} from '../../services/tahunAjaran.js';

describe('Tahun Ajaran Service', () => {
    beforeEach(() => jest.clearAllMocks());

    it('Menambah data tahun ajaran (Nama kosong)', async () => {
        await expect(addTahunAjaran({ status: 'Aktif' })).rejects.toThrow('Nama tahun ajaran wajib diisi');

        expect(prisma.tahunAjaran.findFirst).not.toHaveBeenCalled();
        expect(prisma.tahunAjaran.create).not.toHaveBeenCalled();
    });

    it('Menambah data tahun ajaran (Data sudah ada)', async () => {
        const input = { namaTahunAjaran: '2025/2026', status: 'Aktif' };

        prisma.tahunAjaran.findFirst.mockResolvedValue({ id: 1, ...input });

        await expect(addTahunAjaran(input)).rejects.toThrow('Data sudah ada');

        expect(prisma.tahunAjaran.findFirst).toHaveBeenCalledTimes(1);
        expect(prisma.tahunAjaran.updateMany).not.toHaveBeenCalled();
        expect(prisma.tahunAjaran.create).not.toHaveBeenCalled();
    });

    it('Menambah data tahun ajaran (Berhasil, status Aktif)', async () => {
        const input = { namaTahunAjaran: '2025/2026', status: 'Aktif' };
        const created = { id: 1, ...input };

        prisma.tahunAjaran.findFirst.mockResolvedValue(null);
        prisma.tahunAjaran.create.mockResolvedValue(created);

        const result = await addTahunAjaran(input);

        // tahun ajaran aktif lain harus dinonaktifkan dulu
        expect(prisma.tahunAjaran.updateMany).toHaveBeenCalledWith({
            where: { status: 'Aktif' },
            data: { status: 'Nonaktif' },
        });
        expect(prisma.tahunAjaran.create).toHaveBeenCalledWith({
            data: { namaTahunAjaran: '2025/2026', status: 'Aktif' },
        });
        expect(result).toEqual(created);
    });

    it('Menambah data tahun ajaran (Berhasil, status Nonaktif)', async () => {
        const input = { namaTahunAjaran: '2024/2025', status: 'Nonaktif' };
        const created = { id: 2, ...input };

        prisma.tahunAjaran.findFirst.mockResolvedValue(null);
        prisma.tahunAjaran.create.mockResolvedValue(created);

        const result = await addTahunAjaran(input);

        expect(prisma.tahunAjaran.updateMany).not.toHaveBeenCalled();
        expect(prisma.tahunAjaran.create).toHaveBeenCalledWith({
            data: { namaTahunAjaran: '2024/2025', status: 'Nonaktif' },
        });
        expect(result).toEqual(created);
    });

    it('Menambah data tahun ajaran (Berhasil, status tidak diisi -> default Aktif)', async () => {
        const created = { id: 3, namaTahunAjaran: '2026/2027', status: 'Aktif' };

        prisma.tahunAjaran.findFirst.mockResolvedValue(null);
        prisma.tahunAjaran.create.mockResolvedValue(created);

        const result = await addTahunAjaran({ namaTahunAjaran: '2026/2027' });

        expect(prisma.tahunAjaran.create).toHaveBeenCalledWith({
            data: { namaTahunAjaran: '2026/2027', status: 'Aktif' },
        });
        expect(result).toEqual(created);
    });

    it('Mengedit data tahun ajaran (Tidak ditemukan)', async () => {
        prisma.tahunAjaran.findUnique.mockResolvedValue(null);

        await expect(updateTahunAjaran(99, { namaTahunAjaran: '2025/2026' })).rejects.toThrow(
            'Tahun Ajaran tidak di temukan',
        );

        expect(prisma.tahunAjaran.update).not.toHaveBeenCalled();
    });

    it('Mengedit data tahun ajaran (Nama sudah ada)', async () => {
        const existing = { id: 1, namaTahunAjaran: '2024/2025', status: 'Nonaktif' };
        const duplicate = { id: 2, namaTahunAjaran: '2025/2026', status: 'Aktif' };

        prisma.tahunAjaran.findUnique.mockResolvedValue(existing);
        prisma.tahunAjaran.findFirst.mockResolvedValue(duplicate);

        await expect(updateTahunAjaran(1, { namaTahunAjaran: '2025/2026' })).rejects.toThrow('nama sudah digunakan');

        expect(prisma.tahunAjaran.update).not.toHaveBeenCalled();
    });

    it('Mengedit data tahun ajaran (Berhasil, ubah nama dan status Aktif)', async () => {
        const existing = { id: 1, namaTahunAjaran: '2024/2025', status: 'Nonaktif' };
        const updated = { id: 1, namaTahunAjaran: '2025/2026', status: 'Aktif' };

        prisma.tahunAjaran.findUnique.mockResolvedValue(existing);
        prisma.tahunAjaran.findFirst.mockResolvedValue(null);
        prisma.tahunAjaran.update.mockResolvedValue(updated);

        const result = await updateTahunAjaran(1, { namaTahunAjaran: '2025/2026', status: 'Aktif' });

        expect(prisma.tahunAjaran.updateMany).toHaveBeenCalledWith({
            where: { status: 'Aktif', NOT: { id: 1 } },
            data: { status: 'Nonaktif' },
        });
        expect(prisma.tahunAjaran.update).toHaveBeenCalledTimes(1);
        expect(prisma.tahunAjaran.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 1 },
                data: { namaTahunAjaran: '2025/2026', status: 'Aktif' },
            }),
        );
        expect(result).toEqual(updated);
    });

    it('Mengedit data tahun ajaran (Berhasil, hanya ubah status Nonaktif)', async () => {
        const existing = { id: 1, namaTahunAjaran: '2025/2026', status: 'Aktif' };
        const updated = { id: 1, namaTahunAjaran: '2025/2026', status: 'Nonaktif' };

        prisma.tahunAjaran.findUnique.mockResolvedValue(existing);
        prisma.tahunAjaran.update.mockResolvedValue(updated);

        const result = await updateTahunAjaran(1, { status: 'Nonaktif' });

        expect(prisma.tahunAjaran.findFirst).not.toHaveBeenCalled();
        expect(prisma.tahunAjaran.updateMany).not.toHaveBeenCalled();
        expect(prisma.tahunAjaran.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 1 },
                data: { status: 'Nonaktif' },
            }),
        );
        expect(result).toEqual(updated);
    });

    it('Menampilkan semua data tahun ajaran', async () => {
        const fakeTahunAjaran = [
            { id: 1, namaTahunAjaran: '2024/2025', status: 'Nonaktif' },
            { id: 2, namaTahunAjaran: '2025/2026', status: 'Aktif' },
        ];

        prisma.tahunAjaran.findMany.mockResolvedValue(fakeTahunAjaran);

        const result = await getAllTahunAjaran();

        expect(prisma.tahunAjaran.findMany).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeTahunAjaran);
    });

    it('Menampilkan satu data tahun ajaran (Ditemukan)', async () => {
        const fakeTahunAjaran = { id: 1, namaTahunAjaran: '2025/2026', status: 'Aktif' };

        prisma.tahunAjaran.findUnique.mockResolvedValue(fakeTahunAjaran);

        const result = await getOneTahunAjaran(1);

        expect(prisma.tahunAjaran.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }));
        expect(result).toEqual(fakeTahunAjaran);
    });

    it('Menampilkan satu data tahun ajaran (Tidak ditemukan)', async () => {
        prisma.tahunAjaran.findUnique.mockResolvedValue(null);

        const result = await getOneTahunAjaran(99);

        expect(result).toBeNull();
    });

    it('Delete data tahun ajaran (Berhasil)', async () => {
        const fakeTahunAjaran = { id: 1, namaTahunAjaran: '2025/2026', status: 'Aktif' };

        prisma.tahunAjaran.delete.mockResolvedValue(fakeTahunAjaran);

        const result = await deleteTahunAjaran(1);

        expect(prisma.tahunAjaran.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(fakeTahunAjaran);
    });

    it('Delete data tahun ajaran (Tidak ditemukan)', async () => {
        prisma.tahunAjaran.delete.mockRejectedValue(new Error('Record to delete does not exist.'));

        await expect(deleteTahunAjaran(99)).rejects.toThrow('Record to delete does not exist.');
    });
});
