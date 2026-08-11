import prisma from '../config/prisma.js';

const getTargetKelasId = async (req) => {
    if (req.body?.kelasId) return req.body.kelasId;

    if (req.params?.id && req.baseUrl?.includes('poin-plus')) {
        const poin = await prisma.poinPlus.findUnique({ where: { id: req.params.id }, select: { siswa: { select: { kelasId: true } } } });
        return poin?.siswa?.kelasId ?? null;
    }
    if (req.params?.id && req.baseUrl?.includes('poin-minus')) {
        const poin = await prisma.poinMinus.findUnique({ where: { id: req.params.id }, select: { siswa: { select: { kelasId: true } } } });
        return poin?.siswa?.kelasId ?? null;
    }

    const siswaId = req.params?.siswaId || req.params?.id || req.query?.siswaId || req.body?.siswaId;
    if (!siswaId) return null;

    const siswa = await prisma.siswa.findUnique({ where: { id: siswaId }, select: { kelasId: true } });
    return siswa?.kelasId ?? null;
};

export const authorizeWaliKelasScope = async (req, res, next) => {
    if (req.user?.role !== 'WaliKelas') return next();

    try {
        const kelasId = await getTargetKelasId(req);
        if (!kelasId) return res.status(403).json({ message: 'Siswa harus berada pada kelas wali kelas' });

        const waliKelas = await prisma.user.findFirst({
            where: { id: req.user.id, waliKelas: { some: { id: kelasId } } },
            select: { id: true },
        });
        if (!waliKelas) return res.status(403).json({ message: 'Akses hanya untuk siswa pada kelas yang diampu' });
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const authorizeGuruPelajaranScope = async (req, res, next) => {
    if (req.user?.role !== 'Guru') return next();

    try {
        const pelajaranId = req.params?.pelajaranId;
        const assignment = await prisma.guruPelajaran.findFirst({
            where: { guruId: req.user.id, pelajaranId },
            select: { id: true },
        });
        if (!assignment) return res.status(403).json({ message: 'Anda tidak mengampu mata pelajaran ini' });
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
