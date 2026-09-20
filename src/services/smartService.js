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

// Jumlah baris per satu INSERT (createMany). 1000 baris x ~9 kolom masih
// jauh di bawah batas 32767 parameter PostgreSQL.
const BATCH_SIZE = 1000;

// ============================================================
//  HELPER
// ============================================================

// Pecah array jadi potongan berukuran `size`.
const toChunks = (items, size) => {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
};

// Log waktu per tahap. Aktif hanya jika env SMART_DEBUG=1.
const debugLog = (...args) => {
    if (process.env.SMART_DEBUG === '1') console.log('[SMART]', ...args);
};

const timed = async (label, fn) => {
    const t0 = Date.now();
    debugLog(`${label} ...`);
    const result = await fn();
    debugLog(`${label} selesai (${Date.now() - t0} ms)`);
    return result;
};

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
//  siswaList item: { id, kelasId, kelasIndukId }
//
//  Cara kerja: hapus baris lama milik siswa-siswa ini pada scope
//  yang sama, lalu insert ulang lewat createMany. Semuanya dalam SATU
//  transaksi (atomik: kalau gagal, data lama tetap utuh).
//  Jauh lebih cepat daripada upsert per baris karena hanya beberapa
//  round trip ke database per kelompok.
// ============================================================
const saveNilaiKriteria = async ({ siswaList, tahunAjaranId, normalizations, kriteriaDbMap, scope }) => {
    const rows = siswaList.flatMap((siswa) =>
        KRITERIA_CONFIG.flatMap((kriteria) => {
            const kriteriaId = kriteriaDbMap[kriteria.key];
            if (!kriteriaId) return [];

            const { nilaiRaw, nilaiNormalisasi } = normalizations[siswa.id][kriteria.key];

            return [
                {
                    siswaId: siswa.id,
                    kriteriaId,
                    tahunAjaranId,
                    scope,
                    kelasId: siswa.kelasId,
                    kelasIndukId: siswa.kelasIndukId ?? null,
                    nilaiRaw,
                    nilaiNormalisasi,
                },
            ];
        }),
    );

    const siswaIds = siswaList.map((s) => s.id);

    await prisma.$transaction([
        prisma.nilaiKriteria.deleteMany({
            where: { siswaId: { in: siswaIds }, tahunAjaranId, scope },
        }),
        ...toChunks(rows, BATCH_SIZE).map((data) => prisma.nilaiKriteria.createMany({ data })),
    ]);
};

// ============================================================
//  SIMPAN RANKING KE DB
//  siswaList item: { id, kelasId, kelasIndukId }
// ============================================================
const saveRanking = async ({ siswaList, tahunAjaranId, normalizations, scope }) => {
    const rankings = siswaList
        .map((siswa) => ({
            siswaId: siswa.id,
            kelasId: siswa.kelasId,
            kelasIndukId: siswa.kelasIndukId ?? null,
            nilaiAkhir: KRITERIA_CONFIG.reduce((sum, k) => {
                return sum + (normalizations[siswa.id][k.key]?.nilaiNormalisasi ?? 0) * k.bobot;
            }, 0),
        }))
        .sort((a, b) => b.nilaiAkhir - a.nilaiAkhir)
        .map((row, i) => ({ ...row, tahunAjaranId, scope, peringkat: i + 1 }));

    const siswaIds = siswaList.map((s) => s.id);

    await prisma.$transaction([
        prisma.ranking.deleteMany({
            where: { siswaId: { in: siswaIds }, tahunAjaranId, scope },
        }),
        ...toChunks(rankings, BATCH_SIZE).map((data) => prisma.ranking.createMany({ data })),
    ]);
};

// ============================================================
//  SYNC TABEL KRITERIA
// ============================================================
const syncKriteriaDb = async () => {
    const kriteriaDbMap = {};

    for (const k of KRITERIA_CONFIG) {
        const existing = await prisma.kriteria.findFirst({
            where: { namaKriteria: k.label },
        });

        if (existing) {
            await prisma.kriteria.update({
                where: { id: existing.id },
                data: { bobot: k.bobot, jenis: k.isBenefit ? 'benefit' : 'cost' },
            });
            kriteriaDbMap[k.key] = existing.id;
        } else {
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

    if (!tahunAjaranId) {
        const siswa = await prisma.siswa.findUnique({
            where: { id: siswaId },
            select: { tahunAjaranId: true },
        });
        tahunAjaranId = siswa?.tahunAjaranId;
    }

    if (!tahunAjaranId) return;

    // Ambil semua siswa + kelasIndukId (lewat relasi kelas)
    const siswaRaw = await prisma.siswa.findMany({
        where: { tahunAjaranId },
        select: {
            id: true,
            kelasId: true,
            kelas: {
                select: { kelasIndukId: true },
            },
        },
    });
    if (siswaRaw.length === 0) return;

    // Ratakan struktur: siswa yang belum punya kelas -> kelasIndukId null
    // (siswa tanpa kelasInduk otomatis dilewati saat pengelompokan angkatan)
    const siswaList = siswaRaw.map((s) => ({
        id: s.id,
        kelasId: s.kelasId,
        kelasIndukId: s.kelas?.kelasIndukId ?? null,
    }));

    const siswaIds = siswaList.map((s) => s.id);

    debugLog(`${siswaList.length} siswa dimuat`);
    const kriteriaDbMap = await timed('sync tabel Kriteria', () => syncKriteriaDb());
    const rawValues = await timed('ambil raw values (6 query)', () =>
        buildRawValuesForStudents(siswaIds, tahunAjaranId),
    );

    // ============================================================
    // RANKING ANGKATAN — dikelompokkan per Kelas Induk (jenjang)
    // Siswa tanpa kelasIndukId (belum ditempatkan di kelas) dilewati.
    // ============================================================
    const siswaByKelasInduk = siswaList.reduce((acc, siswa) => {
        if (!siswa.kelasIndukId) return acc;
        acc[siswa.kelasIndukId] = acc[siswa.kelasIndukId] || [];
        acc[siswa.kelasIndukId].push(siswa);
        return acc;
    }, {});

    const angkatanGroups = Object.values(siswaByKelasInduk);
    for (const [gi, angkatanSiswaList] of angkatanGroups.entries()) {
        const tag = `ANGKATAN ${gi + 1}/${angkatanGroups.length} (${angkatanSiswaList.length} siswa)`;
        const angkatanSiswaIds = angkatanSiswaList.map((siswa) => siswa.id);
        const angkatanNormalizations = buildNormalizations(rawValues, angkatanSiswaIds);

        await timed(`${tag} simpan NilaiKriteria`, () =>
            saveNilaiKriteria({
                siswaList: angkatanSiswaList,
                tahunAjaranId,
                normalizations: angkatanNormalizations,
                kriteriaDbMap,
                scope: 'ANGKATAN',
            }),
        );
        await timed(`${tag} simpan Ranking`, () =>
            saveRanking({
                siswaList: angkatanSiswaList,
                tahunAjaranId,
                normalizations: angkatanNormalizations,
                scope: 'ANGKATAN',
            }),
        );
    }

    // ============================================================
    // RANKING KELAS — dikelompokkan per Kelas (tidak berubah)
    // ============================================================
    const siswaByKelas = siswaList.reduce((acc, siswa) => {
        if (!siswa.kelasId) return acc;
        acc[siswa.kelasId] = acc[siswa.kelasId] || [];
        acc[siswa.kelasId].push(siswa);
        return acc;
    }, {});

    const kelasGroups = Object.values(siswaByKelas);
    for (const [gi, kelasSiswaList] of kelasGroups.entries()) {
        const tag = `KELAS ${gi + 1}/${kelasGroups.length} (${kelasSiswaList.length} siswa)`;
        const kelasSiswaIds = kelasSiswaList.map((siswa) => siswa.id);
        const kelasNormalizations = buildNormalizations(rawValues, kelasSiswaIds);

        await timed(`${tag} simpan NilaiKriteria`, () =>
            saveNilaiKriteria({
                siswaList: kelasSiswaList,
                tahunAjaranId,
                normalizations: kelasNormalizations,
                kriteriaDbMap,
                scope: 'KELAS',
            }),
        );
        await timed(`${tag} simpan Ranking`, () =>
            saveRanking({
                siswaList: kelasSiswaList,
                tahunAjaranId,
                normalizations: kelasNormalizations,
                scope: 'KELAS',
            }),
        );
    }
};