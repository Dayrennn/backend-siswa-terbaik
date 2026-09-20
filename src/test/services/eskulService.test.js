jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        eskul: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        nilaiEskulRekap: {
            deleteMany: jest.fn(),
        },
    },
}));

import prisma from '../../config/prisma.js';
import { addEskul, getAllEskul, updateEskul, deleteEskul } from '../../services/eskulService.js';

describe('Eskul Service', () => {
    beforeEach(() => jest.clearAllMocks());


    it('Menambah data eskul (Nama kosong)', async () => {
        await expect(addEskul({ deskripsi: 'Kegiatan kepramukaan' })).rejects.toThrow('Nama Eskul Wajib Di Isi');

        expect(prisma.eskul.findFirst).not.toHaveBeenCalled();
        expect(prisma.eskul.create).not.toHaveBeenCalled();
    });

    it('Menambah data eskul (Nama sudah ada)', async () => {
        const input = { namaEskul: 'Pramuka', deskripsi: 'Kegiatan kepramukaan' };

        prisma.eskul.findFirst.mockResolvedValue({ id: 1, ...input });

        await expect(addEskul(input)).rejects.toThrow('Nama Eskul Sudah Ada');

        expect(prisma.eskul.findFirst).toHaveBeenCalledWith({ where: { namaEskul: 'Pramuka' } });
        expect(prisma.eskul.create).not.toHaveBeenCalled();
    });

    it('Menambah data eskul (Berhasil)', async () => {
        const input = { namaEskul: 'Pramuka', deskripsi: 'Kegiatan kepramukaan' };
        const created = { id: 1, ...input };

        prisma.eskul.findFirst.mockResolvedValue(null);
        prisma.eskul.create.mockResolvedValue(created);

        const result = await addEskul(input);

        expect(prisma.eskul.create).toHaveBeenCalledWith({
            data: { namaEskul: 'Pramuka', deskripsi: 'Kegiatan kepramukaan' },
        });
        expect(result).toEqual(created);
    });

    it('Menambah data eskul (Berhasil, tanpa deskripsi)', async () => {
        const created = { id: 2, namaEskul: 'Futsal', deskripsi: null };

        prisma.eskul.findFirst.mockResolvedValue(null);
        prisma.eskul.create.mockResolvedValue(created);

        const result = await addEskul({ namaEskul: 'Futsal' });

        expect(prisma.eskul.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual(created);
    });


    it('Menampilkan semua data eskul', async () => {
        const fakeEskul = [
            { id: 1, namaEskul: 'Pramuka', deskripsi: 'Kegiatan kepramukaan' },
            { id: 2, namaEskul: 'Futsal', deskripsi: null },
        ];

        prisma.eskul.findMany.mockResolvedValue(fakeEskul);

        const result = await getAllEskul();

        expect(prisma.eskul.findMany).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeEskul);
    });


    it('Mengedit data eskul (Tidak ditemukan)', async () => {
        prisma.eskul.findUnique.mockResolvedValue(null);

        await expect(updateEskul({ id: 99, namaEskul: 'Pramuka' })).rejects.toThrow('Eskul Tidak Ditemukan');

        expect(prisma.eskul.update).not.toHaveBeenCalled();
    });

    it('Mengedit data eskul (Nama sudah ada)', async () => {
        const existing = { id: 1, namaEskul: 'Pramuka', deskripsi: 'Kegiatan kepramukaan' };
        const duplicate = { id: 2, namaEskul: 'Futsal', deskripsi: null };

        prisma.eskul.findUnique.mockResolvedValue(existing);
        prisma.eskul.findFirst.mockResolvedValue(duplicate);

        await expect(updateEskul({ id: 1, namaEskul: 'Futsal' })).rejects.toThrow('Nama sudah ada');

        expect(prisma.eskul.findFirst).toHaveBeenCalledWith({
            where: { namaEskul: 'Futsal', NOT: { id: 1 } },
        });
        expect(prisma.eskul.update).not.toHaveBeenCalled();
    });

    it('Mengedit data eskul (Berhasil, ubah nama dan deskripsi)', async () => {
        const existing = { id: 1, namaEskul: 'Pramuka', deskripsi: 'Kegiatan kepramukaan' };
        const updated = { id: 1, namaEskul: 'Panahan', deskripsi: 'Olahraga memanah' };

        prisma.eskul.findUnique.mockResolvedValue(existing);
        prisma.eskul.findFirst.mockResolvedValue(null); 
        prisma.eskul.update.mockResolvedValue(updated);

        const result = await updateEskul({ id: 1, namaEskul: 'Panahan', deskripsi: 'Olahraga memanah' });

        expect(prisma.eskul.update).toHaveBeenCalledTimes(1);
        expect(prisma.eskul.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 1 },
                data: { namaEskul: 'Panahan', deskripsi: 'Olahraga memanah' },
            }),
        );
        expect(result).toEqual(updated);
    });

    it('Mengedit data eskul (Berhasil, hanya ubah nama)', async () => {
        const existing = { id: 1, namaEskul: 'Pramuka', deskripsi: 'Kegiatan kepramukaan' };
        const updated = { id: 1, namaEskul: 'Panahan', deskripsi: 'Kegiatan kepramukaan' };

        prisma.eskul.findUnique.mockResolvedValue(existing);
        prisma.eskul.findFirst.mockResolvedValue(null);
        prisma.eskul.update.mockResolvedValue(updated);

        const result = await updateEskul({ id: 1, namaEskul: 'Panahan' });

        expect(prisma.eskul.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { namaEskul: 'Panahan' },
            }),
        );
        expect(result).toEqual(updated);
    });

    it('Mengedit data eskul (Berhasil, hanya ubah deskripsi)', async () => {
        const existing = { id: 1, namaEskul: 'Pramuka', deskripsi: 'Lama' };
        const updated = { id: 1, namaEskul: 'Pramuka', deskripsi: 'Baru' };

        prisma.eskul.findUnique.mockResolvedValue(existing);
        prisma.eskul.update.mockResolvedValue(updated);

        const result = await updateEskul({ id: 1, deskripsi: 'Baru' });

        expect(prisma.eskul.findFirst).not.toHaveBeenCalled();
        expect(prisma.eskul.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { deskripsi: 'Baru' },
            }),
        );
        expect(result).toEqual(updated);
    });

    it('Mengedit data eskul (Berhasil, deskripsi dikosongkan)', async () => {
        const existing = { id: 1, namaEskul: 'Pramuka', deskripsi: 'Lama' };
        const updated = { id: 1, namaEskul: 'Pramuka', deskripsi: '' };

        prisma.eskul.findUnique.mockResolvedValue(existing);
        prisma.eskul.update.mockResolvedValue(updated);

        await updateEskul({ id: 1, deskripsi: '' });

        expect(prisma.eskul.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { deskripsi: '' },
            }),
        );
    });


    it('Delete data eskul (Tidak ditemukan)', async () => {
        prisma.eskul.findUnique.mockResolvedValue(null);

        await expect(deleteEskul(99)).rejects.toThrow('Eskul tidak ditemukan');

        expect(prisma.nilaiEskulRekap.deleteMany).not.toHaveBeenCalled();
        expect(prisma.eskul.delete).not.toHaveBeenCalled();
    });

    it('Delete data eskul (Berhasil)', async () => {
        const fakeEskul = { id: 1, namaEskul: 'Pramuka', deskripsi: 'Kegiatan kepramukaan' };

        prisma.eskul.findUnique.mockResolvedValue(fakeEskul);
        prisma.eskul.delete.mockResolvedValue(fakeEskul);

        const result = await deleteEskul(1);

        expect(prisma.nilaiEskulRekap.deleteMany).toHaveBeenCalledWith({ where: { eskulId: 1 } });
        expect(prisma.eskul.delete).toHaveBeenCalledWith({ where: { id: 1 } });

        // rekap harus dihapus sebelum eskul, kalau tidak bisa kena error relasi
        const urutanRekap = prisma.nilaiEskulRekap.deleteMany.mock.invocationCallOrder[0];
        const urutanEskul = prisma.eskul.delete.mock.invocationCallOrder[0];
        expect(urutanRekap).toBeLessThan(urutanEskul);

        expect(result).toEqual(fakeEskul);
    });
});
