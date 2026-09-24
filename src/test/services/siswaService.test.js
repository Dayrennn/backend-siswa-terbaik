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
            count: jest.fn(),
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
            upsert: jest.fn(),
        },
        nilaiKriteria: {
            deleteMany: jest.fn(),
        },
        poinPlus: {
            deleteMany: jest.fn(),
            groupBy: jest.fn(),
        },
        poinMinus: {
            deleteMany: jest.fn(),
            groupBy: jest.fn(),
        },
        hafalan: {
            deleteMany: jest.fn(),
        },
        ranking: {
            deleteMany: jest.fn(),
        },
    },
}));

jest.mock('../../helper/ringkasan.js', () => ({
    __esModule: true,
    hitungRingkasan: jest.fn(),
    hitungRekapKehadiran: jest.fn(),
    hitungPersentaseKehadiran: jest.fn(),
}));

jest.mock('../../services/smartService.js', () => ({
    __esModule: true,
    triggerHitungSMART: jest.fn(),
}));

import prisma from '../../config/prisma.js';
import { addSiswa, deleteSiswa, getAllSiswa, updateSiswa } from '../../services/siswaServices.js';
import { hitungRingkasan } from '../../helper/ringkasan.js';
import { triggerHitungSMART } from '../../services/smartService.js';

describe('Siswa Service', () => {
    beforeEach(() => jest.resetAllMocks());

    const expectedInclude = {
        tahunAjaran: true,
        kelas: true,
        hafalan: true,
        absenRekap: { include: { pelajaran: true } },
        nilaiRekap: { include: { pelajaran: true } },
        nilaiEskulRekap: { include: { eskul: true } },
        nilaiKriteria: { include: { kriteria: true } },
        ranking: true,
        poinPlus: {
            select: { id: true, siswaId: true, deskripsi: true, poin: true, tanggal: true },
            orderBy: { tanggal: 'desc' },
            take: 5,
        },
        poinMinus: {
            select: { id: true, siswaId: true, deskripsi: true, poin: true, tanggal: true },
            orderBy: { tanggal: 'desc' },
            take: 5,
        },
        _count: { select: { poinPlus: true, poinMinus: true } },
    };

    const siswaLengkap = [
        {
            id: 1,
            nis: 1234,
            namaSiswa: 'Asep',
            tahunAjaran: { id: 1, namaTahunAjaran: '2025/2026' },
            kelas: { id: 1, namaKelas: 'Kelas 7A', kodeKelas: '7A' },
            hafalan: { id: 1, siswaId: 1, jumlahJuz: 2 },
            absenRekap: [
                {
                    id: 1,
                    siswaId: 1,
                    pelajaranId: 1,
                    totalPertemuan: 10,
                    totalHadir: 9,
                    totalSakit: 1,
                    totalIzin: 0,
                    totalAlpha: 0,
                    pelajaran: { id: 1, namaPelajaran: 'Matematika' },
                },
            ],
            nilaiRekap: [
                {
                    id: 1,
                    siswaId: 1,
                    pelajaranId: 1,
                    nilaiAkhir: 85,
                    pelajaran: { id: 1, namaPelajaran: 'Matematika' },
                },
            ],
            nilaiEskulRekap: [
                { id: 1, siswaId: 1, eskulId: 1, nilaiAkhir: 90, eskul: { id: 1, namaEskul: 'Pramuka' } },
            ],
            nilaiKriteria: [
                {
                    id: 1,
                    siswaId: 1,
                    kriteriaId: 1,
                    nilaiNormalisasi: 0.8,
                    kriteria: { id: 1, namaKriteria: 'Akademik' },
                },
            ],
            ranking: [{ id: 1, siswaId: 1, peringkat: 1, scope: 'KELAS' }],
            poinPlus: [{ id: 1, siswaId: 1, deskripsi: 'Juara lomba', poin: 10, tanggal: new Date('2026-01-10') }],
            poinMinus: [],
            _count: { poinPlus: 1, poinMinus: 0 },
        },
        {
            id: 2,
            nis: 1235,
            namaSiswa: 'Udin',
            tahunAjaran: { id: 1, namaTahunAjaran: '2025/2026' },
            kelas: { id: 1, namaKelas: 'Kelas 7A', kodeKelas: '7A' },
            hafalan: null,
            absenRekap: [],
            nilaiRekap: [],
            nilaiEskulRekap: [],
            nilaiKriteria: [],
            ranking: [],
            poinPlus: [],
            poinMinus: [{ id: 2, siswaId: 2, deskripsi: 'Terlambat', poin: 5, tanggal: new Date('2026-01-11') }],
            _count: { poinPlus: 0, poinMinus: 1 },
        },
    ];

    it('Lihat data siswa (Berhasil)', async () => {
        prisma.siswa.findMany.mockResolvedValue(siswaLengkap);
        prisma.siswa.count.mockResolvedValue(2);
        prisma.poinPlus.groupBy.mockResolvedValue([{ siswaId: 1, _sum: { poin: 10 } }]);
        prisma.poinMinus.groupBy.mockResolvedValue([{ siswaId: 2, _sum: { poin: 5 } }]);
        hitungRingkasan.mockReturnValueOnce({ rataRataNilai: 85 }).mockReturnValueOnce({ rataRataNilai: 0 });

        const result = await getAllSiswa(1, 10, '');

        expect(prisma.siswa.findMany).toHaveBeenCalledWith({
            where: {},
            skip: 0,
            take: 10,
            include: expectedInclude,
        });
        expect(prisma.siswa.count).toHaveBeenCalledWith({ where: {} });

        expect(prisma.poinPlus.groupBy).toHaveBeenCalledWith({
            by: ['siswaId'],
            where: { siswaId: { in: [1, 2] } },
            _sum: { poin: true },
        });
        expect(prisma.poinMinus.groupBy).toHaveBeenCalledWith({
            by: ['siswaId'],
            where: { siswaId: { in: [1, 2] } },
            _sum: { poin: true },
        });

        expect(hitungRingkasan).toHaveBeenCalledTimes(2);
        expect(hitungRingkasan).toHaveBeenNthCalledWith(1, siswaLengkap[0]);
        expect(hitungRingkasan).toHaveBeenNthCalledWith(2, siswaLengkap[1]);

        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({
            ...siswaLengkap[0],
            totalPoinPlus: 10,
            totalPoinMinus: 0,
            ringkasan: { rataRataNilai: 85 },
        });
        expect(result.data[0].absenRekap[0].pelajaran.namaPelajaran).toBe('Matematika');
        expect(result.data[0].nilaiRekap).toHaveLength(1);
        expect(result.data[0].nilaiEskulRekap).toHaveLength(1);
        expect(result.data[0].nilaiKriteria).toHaveLength(1);
        expect(result.data[0].ranking).toHaveLength(1);

        expect(result.data[1]).toEqual({
            ...siswaLengkap[1],
            totalPoinPlus: 0,
            totalPoinMinus: 5,
            ringkasan: { rataRataNilai: 0 },
        });

        expect(result.meta).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
    });

    it('Lihat data siswa (Dengan search)', async () => {
        
        prisma.siswa.findMany.mockResolvedValue([siswaLengkap[0]]);
        prisma.siswa.count.mockResolvedValue(1);
        prisma.poinPlus.groupBy.mockResolvedValue([]);
        prisma.poinMinus.groupBy.mockResolvedValue([]);
        hitungRingkasan.mockReturnValue({});

        await getAllSiswa(1, 10, '  asep  ');

        const expectedWhere = { namaSiswa: { contains: 'asep', mode: 'insensitive' } };
        expect(prisma.siswa.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expectedWhere }));
        expect(prisma.siswa.count).toHaveBeenCalledWith({ where: expectedWhere });
    });

    it('Lihat data siswa (Pagination halaman 2)', async () => {
        prisma.siswa.findMany.mockResolvedValue(siswaLengkap);
        prisma.siswa.count.mockResolvedValue(25);
        prisma.poinPlus.groupBy.mockResolvedValue([]);
        prisma.poinMinus.groupBy.mockResolvedValue([]);
        hitungRingkasan.mockReturnValue({});

        const result = await getAllSiswa(2, 10);

        expect(prisma.siswa.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
        expect(result.meta).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3 });
    });

    it('Lihat data siswa (Data kosong)', async () => {
        prisma.siswa.findMany.mockResolvedValue([]);
        prisma.siswa.count.mockResolvedValue(0);
        prisma.poinPlus.groupBy.mockResolvedValue([]);
        prisma.poinMinus.groupBy.mockResolvedValue([]);

        const result = await getAllSiswa();

        expect(result.data).toEqual([]);
        expect(result.meta.totalPages).toBe(0);
        expect(prisma.poinPlus.groupBy).toHaveBeenCalledWith(
            expect.objectContaining({ where: { siswaId: { in: [] } } }),
        );
    });

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

    it('Mengedit data siswa (Siswa tidak ditemukan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue(null);

        await expect(updateSiswa(1, { namaSiswa: 'udin' })).rejects.toThrow('Siswa tidak ditemukan');
        expect(prisma.siswa.update).not.toHaveBeenCalled();
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
        const existing = { id: 1, namaSiswa: 'udin', kelasId: 1, tahunAjaranId: 1 };
        const updated = { id: 1, namaSiswa: 'saepul' };

        prisma.siswa.findUnique.mockResolvedValue(existing);
        prisma.siswa.findFirst.mockResolvedValue(null);
        prisma.siswa.update.mockResolvedValue(updated);

        const result = await updateSiswa(1, { namaSiswa: 'saepul' });

        expect(prisma.siswa.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { namaSiswa: 'saepul' },
        });
        expect(triggerHitungSMART).toHaveBeenCalledWith({ siswaId: 1 });
        expect(result).toEqual(updated);
    });

    it('Delete data siswa (Data Tidak ditemukan)', async () => {
        prisma.siswa.findUnique.mockResolvedValue(null);

        await expect(deleteSiswa(1)).rejects.toThrow('Siswa tidak ditemukan');

        expect(prisma.siswa.delete).not.toHaveBeenCalled();
    });

    it('Delete data siswa (Berhasil)', async () => {
        const fakeSiswa = { id: 1, namaSiswa: 'saepul', tahunAjaranId: 1 };

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

        expect(prisma.siswa.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(triggerHitungSMART).toHaveBeenCalledWith({ tahunAjaranId: 1 });
        expect(result).toEqual(fakeSiswa);
    });
});
