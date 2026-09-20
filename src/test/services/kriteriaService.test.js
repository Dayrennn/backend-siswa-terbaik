jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        kriteria: {
            findMany: jest.fn(),
        },
    },
}));

import prisma from '../../config/prisma.js';
import { getKriteria } from '../../services/kriteriaService.js';

describe('Kriteria Service', () => {
    beforeEach(() => jest.clearAllMocks());

    it('Menampilkan data kriteria', async () => {
        const fakeKriteria = [
            { id: 1, namaKriteria: 'Nilai Akademik', bobot: 0.4, jenis: 'Benefit' },
            { id: 2, namaKriteria: 'Poin Minus', bobot: 0.2, jenis: 'Cost' },
        ];

        prisma.kriteria.findMany.mockResolvedValue(fakeKriteria);

        const result = await getKriteria();

        expect(prisma.kriteria.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.kriteria.findMany).toHaveBeenCalledWith({
            select: {
                id: true,
                namaKriteria: true,
                bobot: true,
                jenis: true,
            },
        });
        expect(result).toEqual(fakeKriteria);
    });

    it('Menampilkan data kriteria (Data kosong)', async () => {
        prisma.kriteria.findMany.mockResolvedValue([]);

        const result = await getKriteria();

        expect(result).toEqual([]);
    });
});
