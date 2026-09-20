jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        kelas: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        kelasInduk: {
            findFirst: jest.fn(),
        },
        tahunAjaran: {
            findFirst: jest.fn(),
        },
        siswa: {
            findMany: jest.fn(),
            deleteMany: jest.fn(),
            updateMany: jest.fn(),
        },
        absenRekap: {
            createMany: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        nilaiRekap: {
            createMany: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        nilaiEskulRekap: {
            deleteMany: jest.fn(),
        },
    },
}));

import prisma from '../../config/prisma.js';
import { addKelas, deleteKelas, updateKelas } from '../../services/kelasService.js';

describe('Kelas Service', () => {
    beforeEach(() => jest.clearAllMocks());

    it('Menambah data kelas (Data sudah ada)', async () => {
        const dataKelas = {
            namaKelas: 'Utsman',
            kodeKelas: '6A',
            tahunAjaranId: 1,
            kelasIndukId: 1,
        };

        prisma.kelas.findFirst.mockResolvedValue({ id: 1, ...dataKelas });

        await expect(addKelas(dataKelas)).rejects.toThrow('Data sudah ada');

        expect(prisma.kelas.findFirst).toHaveBeenCalledTimes(1);
        expect(prisma.kelas.create).not.toHaveBeenCalled();
    });

    it('Menambah data kelas (Berhasil)', async () => {
        const created = {
            namaKelas: 'Utsman',
            kodeKelas: '6A',
            tahunAjaranId: 1,
            kelasIndukId: 1,
        };

        prisma.kelas.findFirst.mockResolvedValue(null);
        prisma.kelas.create.mockResolvedValue(created);

        const result = await addKelas({ namaKelas: 'Utsman', kodeKelas: '6A', tahunAjaranId: 1, kelasIndukId: 1 });
        expect(result).toEqual(created);
    });

    it('Mengedit data kelas (Nama sudah ada)', async () => {
        const existing = { id: 1, namaKelas: 'Utsman', kodeKelas: '6A', tahunAjaranId: 1, kelasIndukId: 1 };
        const duplicate = { id: 2, namaKelas: 'Hasan', kodeKelas: '6B', tahunAjaranId: 1, kelasIndukId: 1 };

        prisma.kelas.findUnique.mockResolvedValue(existing);
        prisma.kelas.findFirst.mockResolvedValue(duplicate);

        await expect(updateKelas(1, { namaKelas: 'Hasan', kodeKelas: '6B' })).rejects.toThrow(
            'Kelas dengan kode, nama, dan kelas induk yang sama sudah ada',
        );

        expect(prisma.kelas.update).not.toHaveBeenCalled();
    });

    it('Mengedit data kelas (Berhasil)', async () => {
        const data = { id: 1, namaKelas: 'Utsman', kodeKelas: '6A', tahunAjaranId: 1, kelasIndukId: 1 };
        const updated = { id: 1, namaKelas: 'Hasan', kodeKelas: '6B', tahunAjaranId: 1, kelasIndukId: 1 };

        prisma.kelas.findFirst.mockResolvedValue(data);
        prisma.kelas.update.mockResolvedValue(updated);

        await expect(
            updateKelas(1, { namaKelas: 'Hasan', kodeKelas: '6B', tahunAjaranId: 1, kelasIndukId: 1 }),
        ).rejects.toThrow('Kelas dengan kode, nama, dan kelas induk yang sama sudah ada');

        expect(prisma.kelas.update).not.toHaveBeenCalled();
    });

    it('Delete data kelas (Data Tidak ditemukan)', async () => {
        prisma.kelas.findUnique.mockResolvedValue(null);

        await expect(deleteKelas(1)).rejects.toThrow('Kelas tidak ditemukan');

        expect(prisma.kelas.delete).not.toHaveBeenCalled();
    });

    it('Delete data kelas (Berhasil)', async () => {
        const fakeKelas = { id: 1, namaKelas: 'Hasan', kodeKelas: '6B', tahunAjaranId: 1, kelasIndukId: 1 };

        prisma.kelas.findUnique.mockResolvedValue(fakeKelas);
        prisma.siswa.findMany.mockResolvedValue([]); 
        prisma.kelas.delete.mockResolvedValue(fakeKelas);

        const result = await deleteKelas(1);

        expect(prisma.nilaiRekap.deleteMany).toHaveBeenCalledWith({ where: { kelasId: 1 } });
        expect(prisma.siswa.updateMany).toHaveBeenCalledWith({
            where: { kelasId: 1 },
            data: { kelasId: null },
        });
        expect(prisma.kelas.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(fakeKelas);
    });
});
