import prisma from '../config/prisma.js';

// ============================================================
//  KRITERIA HARDCODED — tidak perlu tabel Kriteria
// ============================================================
const KRITERIA_CONFIG = [
    { key: 'nilaiAkademik',   bobot: 0.35, isBenefit: true, label: 'Nilai Akademik' },
    { key: 'persentaseHadir', bobot: 0.25, isBenefit: true, label: 'Kehadiran' },
    { key: 'jumlahJuz',       bobot: 0.20, isBenefit: true, label: 'Hafalan' },
    { key: 'netPoin',         bobot: 0.15, isBenefit: true, label: 'Poin Perilaku' },
    { key: 'nilaiEskul',      bobot: 0.05, isBenefit: true, label: 'Nilai Eskul' },
];

// ============================================================
//  NORMALISASI
// ============================================================
const normalizeValue = (value, min, max, isBenefit) => {
    if (min === max) return 1;
    return isBenefit
        ? (value - min) / (max - min)
        : (max - value) / (max - min);
};

// ============================================================
//  AMBIL RAW VALUES DARI MODEL YANG ADA
// ============================================================
const buildRawValuesForStudents = async (siswaIds, tahunAjaranId) => {
    const [nilaiRekap, absenRekap, nilaiEskulRekap, hafalan, poinPlus, poinMinus] = await Promise.all([
        prisma.nilaiRekap.findMany({
            where: { siswaId: { in: siswaIds }, tahunAjaranId },
            select: { siswaId: true, nilaiAkhir: true },
        }),
        prisma.absenRekap.findMany({
            where: { siswaId: { in: siswaIds }, tahunAjaranId },
            select: { siswaId: true, totalPertemuan: true, totalHadir: true },
        }),
        prisma.nilaiEskulRekap.findMany({
            where: { siswaId: { in: siswaIds }, tahunAjaranId },
            select: { siswaId: true, nilaiAkhir: true },
        }),
        prisma.hafalan.findMany({
            where: { siswaId: { in: siswaIds } },
            select: { siswaId: true, jumlahJuz: true },
        }),
        prisma.poinPlus.groupBy({
            by: ['siswaId'],
            where: {
                siswaId: { in: siswaIds },
                OR: [{ tahunAjaranId }, { tahunAjaranId: null }],
            },
            _sum: { poin: true },
        }),
        prisma.poinMinus.groupBy({
            by: ['siswaId'],
            where: {
                siswaId: { in: siswaIds },
                OR: [{ tahunAjaranId }, { tahunAjaranId: null }],
            },
            _sum: { poin: true },
        }),
    ]);

    // Build maps per siswaId
    const nilaiRekapMap = nilaiRekap.reduce((acc, item) => {
        acc[item.siswaId] = acc[item.siswaId] || [];
        acc[item.siswaId].push(item.nilaiAkhir ?? 0);
        return acc;
    }, {});

    const absenMap = absenRekap.reduce((acc, item) => {
        acc[item.siswaId] = acc[item.siswaId] || { totalPertemuan: 0, totalHadir: 0 };
        acc[item.siswaId].totalPertemuan += item.totalPertemuan ?? 0;
        acc[item.siswaId].totalHadir += item.totalHadir ?? 0;
        return acc;
    }, {});

    const eskulMap = nilaiEskulRekap.reduce((acc, item) => {
        acc[item.siswaId] = acc[item.siswaId] || [];
        acc[item.siswaId].push(item.nilaiAkhir ?? 0);
        return acc;
    }, {});

    const hafalanMap = hafalan.reduce((acc, item) => {
        acc[item.siswaId] = item.jumlahJuz ?? 0;
        return acc;
    }, {});

    const plusMap = poinPlus.reduce((acc, item) => {
        acc[item.siswaId] = item._sum.poin ?? 0;
        return acc;
    }, {});

    const minusMap = poinMinus.reduce((acc, item) => {
        acc[item.siswaId] = item._sum.poin ?? 0;
        return acc;
    }, {});

    // Gabungkan semua jadi satu raw value per siswa
    return siswaIds.reduce((acc, id) => {
        const nilaiArr  = nilaiRekapMap[id] || [];
        const eskulArr  = eskulMap[id] || [];
        const absen     = absenMap[id] || { totalPertemuan: 0, totalHadir: 0 };
        const plus      = plusMap[id] ?? 0;
        const minus     = minusMap[id] ?? 0;

        acc[id] = {
            nilaiAkademik: nilaiArr.length
                ? nilaiArr.reduce((s, v) => s + v, 0) / nilaiArr.length
                : 0,
            persentaseHadir: absen.totalPertemuan > 0
                ? (absen.totalHadir / absen.totalPertemuan) * 100
                : 0,
            jumlahJuz:  hafalanMap[id] ?? 0,
            netPoin:    plus - minus,
            nilaiEskul: eskulArr.length
                ? eskulArr.reduce((s, v) => s + v, 0) / eskulArr.length
                : 0,
        };

        return acc;
    }, {});
};

// ============================================================
//  NORMALISASI PER KRITERIA
// ============================================================
const buildNormalizations = (rawValuesByStudent, siswaIds) => {
    const normalizations = {};

    for (const kriteria of KRITERIA_CONFIG) {
        const values = siswaIds.map((id) => rawValuesByStudent[id][kriteria.key] ?? 0);
        const min = Math.min(...values);
        const max = Math.max(...values);

        for (const id of siswaIds) {
            const nilaiRaw = rawValuesByStudent[id][kriteria.key] ?? 0;
            normalizations[id] = normalizations[id] || {};
            normalizations[id][kriteria.key] = {
                nilaiRaw,
                nilaiNormalisasi: normalizeValue(nilaiRaw, min, max, kriteria.isBenefit),
            };
        }
    }

    return normalizations;
};

// ============================================================
//  SIMPAN NILAI KRITERIA KE DB
// ============================================================
const saveNilaiKriteria = async ({ siswaList, tahunAjaranId, normalizations, kriteriaDbMap, scope }) => {
    await Promise.all(
        siswaList.flatMap((siswa) =>
            KRITERIA_CONFIG.map((kriteria) => {
                const kriteriaId = kriteriaDbMap[kriteria.key];
                if (!kriteriaId) return Promise.resolve();

                const { nilaiRaw, nilaiNormalisasi } = normalizations[siswa.id][kriteria.key];

                return prisma.nilaiKriteria.upsert({
                    where: {
                        siswaId_kriteriaId_tahunAjaranId_scope: {
                            siswaId: siswa.id,
                            kriteriaId,
                            tahunAjaranId,
                            scope,
                        },
                    },
                    update: { kelasId: siswa.kelasId, nilaiRaw, nilaiNormalisasi },
                    create: {
                        siswaId: siswa.id,
                        kriteriaId,
                        tahunAjaranId,
                        kelasId: siswa.kelasId,
                        scope,
                        nilaiRaw,
                        nilaiNormalisasi,
                    },
                });
            }),
        ),
    );
};

// ============================================================
//  SIMPAN RANKING KE DB
// ============================================================
const saveRanking = async ({ siswaList, tahunAjaranId, normalizations, scope }) => {
    const rankings = siswaList
        .map((siswa) => ({
            siswaId: siswa.id,
            kelasId: siswa.kelasId,
            nilaiAkhir: KRITERIA_CONFIG.reduce((sum, k) => {
                return sum + (normalizations[siswa.id][k.key]?.nilaiNormalisasi ?? 0) * k.bobot;
            }, 0),
        }))
        .sort((a, b) => b.nilaiAkhir - a.nilaiAkhir)
        .map((row, i) => ({ ...row, peringkat: i + 1 }));

    await Promise.all(
        rankings.map((row) =>
            prisma.ranking.upsert({
                where: {
                    siswaId_tahunAjaranId_scope: {
                        siswaId: row.siswaId,
                        tahunAjaranId,
                        scope,
                    },
                },
                update: { kelasId: row.kelasId, nilaiAkhir: row.nilaiAkhir, peringkat: row.peringkat },
                create: {
                    siswaId: row.siswaId,
                    tahunAjaranId,
                    kelasId: row.kelasId,
                    scope,
                    nilaiAkhir: row.nilaiAkhir,
                    peringkat: row.peringkat,
                },
            }),
        ),
    );
};

// ============================================================
//  SYNC TABEL KRITERIA — pastikan baris default selalu ada
//  sehingga NilaiKriteria tetap bisa tersimpan dengan kriteriaId
// ============================================================
const syncKriteriaDb = async () => {
    const kriteriaDbMap = {}; // key -> kriteriaId

    for (const k of KRITERIA_CONFIG) {
        const existing = await prisma.kriteria.findFirst({
            where: { namaKriteria: k.label },
        });

        if (existing) {
            // Update bobot/jenis kalau berbeda
            await prisma.kriteria.update({
                where: { id: existing.id },
                data: { bobot: k.bobot, jenis: k.isBenefit ? 'benefit' : 'cost' },
            });
            kriteriaDbMap[k.key] = existing.id;
        } else {
            // Buat baru kalau belum ada
            const created = await prisma.kriteria.create({
                data: {
                    namaKriteria: k.label,
                    bobot: k.bobot,
                    jenis: k.isBenefit ? 'benefit' : 'cost',
                },
            });
            kriteriaDbMap[k.key] = created.id;
        }
    }

    return kriteriaDbMap;
};

// ============================================================
//  MAIN TRIGGER
// ============================================================
export const triggerHitungSMART = async ({ siswaId, tahunAjaranId } = {}) => {
    if (!siswaId && !tahunAjaranId) return;

    // Resolve tahunAjaranId dari siswaId kalau tidak dikirim
    if (!tahunAjaranId) {
        const siswa = await prisma.siswa.findUnique({
            where: { id: siswaId },
            select: { tahunAjaranId: true },
        });
        tahunAjaranId = siswa?.tahunAjaranId;
    }

    if (!tahunAjaranId) return;

    // Ambil semua siswa dalam tahun ajaran ini
    const siswaList = await prisma.siswa.findMany({
        where: { tahunAjaranId },
        select: { id: true, kelasId: true },
    });
    if (siswaList.length === 0) return;

    const siswaIds = siswaList.map((s) => s.id);

    // Pastikan tabel Kriteria punya baris yang sesuai KRITERIA_CONFIG
    const kriteriaDbMap = await syncKriteriaDb();

    // Ambil raw values dari semua model yang ada
    const rawValues = await buildRawValuesForStudents(siswaIds, tahunAjaranId);

    // Ranking angkatan: semua siswa dalam tahun ajaran yang sama dibandingkan bersama.
    const angkatanNormalizations = buildNormalizations(rawValues, siswaIds);
    await saveNilaiKriteria({
        siswaList,
        tahunAjaranId,
        normalizations: angkatanNormalizations,
        kriteriaDbMap,
        scope: 'ANGKATAN',
    });
    await saveRanking({ siswaList, tahunAjaranId, normalizations: angkatanNormalizations, scope: 'ANGKATAN' });

    // Ranking kelas: siswa hanya dibandingkan dengan teman satu kelas.
    const siswaByKelas = siswaList.reduce((acc, siswa) => {
        if (!siswa.kelasId) return acc;
        acc[siswa.kelasId] = acc[siswa.kelasId] || [];
        acc[siswa.kelasId].push(siswa);
        return acc;
    }, {});

    for (const kelasSiswaList of Object.values(siswaByKelas)) {
        const kelasSiswaIds = kelasSiswaList.map((siswa) => siswa.id);
        const kelasNormalizations = buildNormalizations(rawValues, kelasSiswaIds);

        await saveNilaiKriteria({
            siswaList: kelasSiswaList,
            tahunAjaranId,
            normalizations: kelasNormalizations,
            kriteriaDbMap,
            scope: 'KELAS',
        });
        await saveRanking({ siswaList: kelasSiswaList, tahunAjaranId, normalizations: kelasNormalizations, scope: 'KELAS' });
    }
};
