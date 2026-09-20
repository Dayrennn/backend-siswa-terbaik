jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        siswa: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        pelajaran: {
            findMany: jest.fn(),
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
        nilaiKriteria: {
            deleteMany: jest.fn(),
        },
        poinPlus: {
            deleteMany: jest.fn(),
        },
        poinMinus: {
            deleteMany: jest.fn(),
        },
        hafalan: {
            deleteMany: jest.fn(),
        },
        ranking: {
            deleteMany: jest.fn(),
        },
    },
}));

import prisma from '../../config/prisma.js';
import { addSiswa, deleteSiswa, updateSiswa } from '../../services/siswaServices.js';

describe('Siswa Service', () => {
    beforeEach(() => jest.clearAllMocks());

    it('Menambah Data Siswa (Data sudah ada)', async () => {
        prisma.siswa.findFirst.mockResolvedValue({
            id: 1,
            namaSiswa: 'Bahlul',
        });
        await expect(addSiswa({ namaSiswa: 'Bahlul' })).rejects.toThrow('Data siswa sudah ada');
        expect(prisma.siswa.create).not.toHaveBeenCalled();
    });

    it('Menambah Data Siswa (Berhasil)', async () => {
        const created = { id: 1, namaSiswa: 'Bahlul' };

        prisma.siswa.findFirst.mockResolvedValue(null);
        prisma.siswa.create.mockResolvedValue(created);
        prisma.pelajaran.findMany.mockResolvedValue([]);
        prisma.absenRekap.createMany.mockResolvedValue([]);
        prisma.nilaiRekap.createMany.mockResolvedValue([]);

        const result = await addSiswa({ id: 1, namaSiswa: 'Bahlul' });
        expect(result).toEqual(created);
    });

    it('Mengedit data siswa (Nama sudah ada)', async () => {
        const existing = { id: 1, namaSiswa: 'asep' };
        const duplicate = { id: 2, namaSiswa: 'udin' };

        prisma.siswa.findUnique.mockResolvedValue(existing);
        prisma.siswa.findFirst.mockResolvedValue(duplicate);

        await expect(updateSiswa(1, { namaSiswa: 'udin' })).rejects.toThrow('nis dan nama sudah digunakan');

        expect(prisma.siswa.update).not.toHaveBeenCalled();
    });

    it('Mengedit data siswa (Berhasil)', async () => {
        const data = { id: 1, namaSiswa: 'udin' };
        const updated = { id: 1, namaSiswa: 'saepul' };

        prisma.siswa.update.mockResolvedValue(data);
        prisma.pelajaran.findMany.mockResolvedValue([]);
        prisma.absenRekap.findMany.mockResolvedValue([]);
        prisma.nilaiRekap.findMany.mockResolvedValue([]);
        prisma.siswa.update.mockResolvedValue(updated);

        await expect(updateSiswa(1, { namaSiswa: 'saepul' })).rejects.toThrow('nis dan nama sudah digunakan');
        expect(prisma.siswa.update).not.toHaveBeenCalled();
    });

    it('Delete data siswa (Data Tidak ditemukan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue(null);

        await expect(deleteSiswa(1)).rejects.toThrow('Siswa tidak ditemukan');

        expect(prisma.siswa.delete).not.toHaveBeenCalled();
    });

    it('Delete data siswa (Berhasil)', async () => {
        const fakeSiswa = {
            id: 1,
            namaSiswa: 'saepul',
        };

        prisma.siswa.findUnique.mockResolvedValue(fakeSiswa);
        prisma.siswa.delete.mockResolvedValue(fakeSiswa);
        prisma.nilaiRekap.deleteMany.mockResolvedValue([]);
        prisma.absenRekap.deleteMany.mockResolvedValue([]);
        prisma.nilaiEskulRekap.deleteMany.mockResolvedValue([]);
        prisma.nilaiKriteria.deleteMany.mockResolvedValue([]);
        prisma.poinMinus.deleteMany.mockResolvedValue([]);
        prisma.poinPlus.deleteMany.mockResolvedValue([]);
        prisma.hafalan.deleteMany.mockResolvedValue([]);
        prisma.ranking.deleteMany.mockResolvedValue([]);

        const result = await deleteSiswa(1);

        expect(prisma.siswa.delete).toHaveBeenCalled();
        expect(result).toEqual(fakeSiswa);
    });
});
