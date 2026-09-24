import prisma from '../config/prisma.js';

// ============================================================
//  KONFIGURASI KRITERIA SMART
// ============================================================
//
// K1 = Nilai Akademik       -> Benefit -> 35%
// K2 = Kehadiran            -> Benefit -> 25%
// K3 = Hafalan Qur'an       -> Benefit -> 20%
// K4 = Poin Perilaku Baik   -> Benefit -> 7.5%
// K5 = Poin Perilaku Buruk  -> Cost    -> 7.5%
// K6 = Nilai Ekstrakurikuler-> Benefit -> 5%
//
// TOTAL = 100%
//
// Catatan:
// - Poin perilaku baik dan buruk dipisahkan.
// - Tidak menggunakan netPoin lagi.
// ============================================================

const KRITERIA_CONFIG = [
    {
        key: 'nilaiAkademik',
        bobot: 0.35,
        isBenefit: true,
        label: 'Nilai Akademik',
    },
    {
        key: 'persentaseHadir',
        bobot: 0.25,
        isBenefit: true,
        label: 'Kehadiran',
    },
    {
        key: 'jumlahJuz',
        bobot: 0.2,
        isBenefit: true,
        label: "Hafalan Qur'an",
    },
    {
        key: 'poinPlus',
        bobot: 0.075,
        isBenefit: true,
        label: 'Poin Perilaku Baik',
    },
    {
        key: 'poinMinus',
        bobot: 0.075,
        isBenefit: false,
        label: 'Poin Perilaku Buruk',
    },
    {
        key: 'nilaiEskul',
        bobot: 0.05,
        isBenefit: true,
        label: 'Nilai Ekstrakurikuler',
    },
];

// Pastikan total bobot = 1
const TOTAL_BOBOT = KRITERIA_CONFIG.reduce((total, kriteria) => total + kriteria.bobot, 0);

if (Math.abs(TOTAL_BOBOT - 1) > 0.000001) {
    throw new Error(`Total bobot SMART harus 1.000. Saat ini: ${TOTAL_BOBOT}`);
}

// Jumlah baris per satu INSERT createMany.
const BATCH_SIZE = 1000;

// ============================================================
// HELPER
// ============================================================

// Pecah array menjadi beberapa bagian.
const toChunks = (items, size) => {
    const out = [];

    for (let i = 0; i < items.length; i += size) {
        out.push(items.slice(i, i + size));
    }

    return out;
};

// Log waktu per tahap.
// Aktif hanya jika SMART_DEBUG=1.
const debugLog = (...args) => {
    if (process.env.SMART_DEBUG === '1') {
        console.log('[SMART]', ...args);
    }
};

const timed = async (label, fn) => {
    const t0 = Date.now();

    debugLog(`${label} ...`);

    const result = await fn();

    debugLog(`${label} selesai (${Date.now() - t0} ms)`);

    return result;
};

// ============================================================
// NORMALISASI SMART
// ============================================================
//
// Benefit:
// Ui = (Cout - Cmin) / (Cmax - Cmin)
//
// Cost:
// Ui = (Cmax - Cout) / (Cmax - Cmin)
//
// Jika Cmax = Cmin, nilai normalisasi dibuat 1.
// ============================================================

const normalizeValue = (value, min, max, isBenefit) => {
    if (min === max) {
        return 1;
    }

    return isBenefit ? (value - min) / (max - min) : (max - value) / (max - min);
};

// ============================================================
// AMBIL RAW VALUES DARI DATABASE
// ============================================================

const buildRawValuesForStudents = async (siswaIds, tahunAjaranId) => {
    const [nilaiRekap, absenRekap, nilaiEskulRekap, hafalan, poinPlus, poinMinus] = await Promise.all([
        // ========================================================
        // K1 - NILAI AKADEMIK
        // ========================================================
        prisma.nilaiRekap.findMany({
            where: {
                siswaId: {
                    in: siswaIds,
                },
                tahunAjaranId,
            },
            select: {
                siswaId: true,
                nilaiAkhir: true,
            },
        }),

        // ========================================================
        // K2 - KEHADIRAN
        // ========================================================
        prisma.absenRekap.findMany({
            where: {
                siswaId: {
                    in: siswaIds,
                },
                tahunAjaranId,
            },
            select: {
                siswaId: true,
                totalPertemuan: true,
                totalHadir: true,
            },
        }),

        // ========================================================
        // K6 - NILAI EKSTRAKURIKULER
        // ========================================================
        prisma.nilaiEskulRekap.findMany({
            where: {
                siswaId: {
                    in: siswaIds,
                },
                tahunAjaranId,
            },
            select: {
                siswaId: true,
                nilaiAkhir: true,
            },
        }),

        // ========================================================
        // K3 - HAFALAN QUR'AN
        // ========================================================
        prisma.hafalan.findMany({
            where: {
                siswaId: {
                    in: siswaIds,
                },
            },
            select: {
                siswaId: true,
                jumlahJuz: true,
            },
        }),

        // ========================================================
        // K4 - POIN PERILAKU BAIK
        // ========================================================
        prisma.poinPlus.groupBy({
            by: ['siswaId'],
            where: {
                siswaId: {
                    in: siswaIds,
                },
                OR: [
                    {
                        tahunAjaranId,
                    },
                    {
                        tahunAjaranId: null,
                    },
                ],
            },
            _sum: {
                poin: true,
            },
        }),

        // ========================================================
        // K5 - POIN PERILAKU BURUK
        // ========================================================
        prisma.poinMinus.groupBy({
            by: ['siswaId'],
            where: {
                siswaId: {
                    in: siswaIds,
                },
                OR: [
                    {
                        tahunAjaranId,
                    },
                    {
                        tahunAjaranId: null,
                    },
                ],
            },
            _sum: {
                poin: true,
            },
        }),
    ]);

    // ============================================================
    // MAP NILAI AKADEMIK
    // ============================================================

    const nilaiRekapMap = nilaiRekap.reduce((acc, item) => {
        acc[item.siswaId] = acc[item.siswaId] || [];

        acc[item.siswaId].push(item.nilaiAkhir ?? 0);

        return acc;
    }, {});

    // ============================================================
    // MAP KEHADIRAN
    // ============================================================

    const absenMap = absenRekap.reduce((acc, item) => {
        acc[item.siswaId] = acc[item.siswaId] || {
            totalPertemuan: 0,
            totalHadir: 0,
        };

        acc[item.siswaId].totalPertemuan += item.totalPertemuan ?? 0;

        acc[item.siswaId].totalHadir += item.totalHadir ?? 0;

        return acc;
    }, {});

    // ============================================================
    // MAP NILAI EKSTRAKURIKULER
    // ============================================================

    const eskulMap = nilaiEskulRekap.reduce((acc, item) => {
        acc[item.siswaId] = acc[item.siswaId] || [];

        acc[item.siswaId].push(item.nilaiAkhir ?? 0);

        return acc;
    }, {});

    // ============================================================
    // MAP HAFALAN
    // ============================================================

    const hafalanMap = hafalan.reduce((acc, item) => {
        acc[item.siswaId] = item.jumlahJuz ?? 0;

        return acc;
    }, {});

    // ============================================================
    // MAP POIN PERILAKU BAIK
    // ============================================================

    const plusMap = poinPlus.reduce((acc, item) => {
        acc[item.siswaId] = item._sum.poin ?? 0;

        return acc;
    }, {});

    // ============================================================
    // MAP POIN PERILAKU BURUK
    // ============================================================

    const minusMap = poinMinus.reduce((acc, item) => {
        acc[item.siswaId] = item._sum.poin ?? 0;

        return acc;
    }, {});

    // ============================================================
    // GABUNGKAN SEMUA NILAI
    // ============================================================

    return siswaIds.reduce((acc, id) => {
        const nilaiArr = nilaiRekapMap[id] || [];

        const eskulArr = eskulMap[id] || [];

        const absen = absenMap[id] || {
            totalPertemuan: 0,
            totalHadir: 0,
        };

        const poinBaik = plusMap[id] ?? 0;

        const poinBuruk = minusMap[id] ?? 0;

        acc[id] = {
            // =================================================
            // K1
            // =================================================
            nilaiAkademik: nilaiArr.length ? nilaiArr.reduce((sum, value) => sum + value, 0) / nilaiArr.length : 0,

            // =================================================
            // K2
            // =================================================
            persentaseHadir: absen.totalPertemuan > 0 ? (absen.totalHadir / absen.totalPertemuan) * 100 : 0,

            // =================================================
            // K3
            // =================================================
            jumlahJuz: hafalanMap[id] ?? 0,

            // =================================================
            // K4
            // Poin Perilaku Baik
            // =================================================
            poinPlus: poinBaik,

            // =================================================
            // K5
            // Poin Perilaku Buruk
            // =================================================
            poinMinus: poinBuruk,

            // =================================================
            // K6
            // =================================================
            nilaiEskul: eskulArr.length ? eskulArr.reduce((sum, value) => sum + value, 0) / eskulArr.length : 0,
        };

        return acc;
    }, {});
};

// ============================================================
// NORMALISASI PER KRITERIA
// ============================================================

const buildNormalizations = (rawValuesByStudent, siswaIds) => {
    const normalizations = {};

    for (const kriteria of KRITERIA_CONFIG) {
        // Ambil seluruh nilai siswa pada kriteria tersebut.
        const values = siswaIds.map((id) => rawValuesByStudent[id]?.[kriteria.key] ?? 0);

        // Cari Cmin.
        const min = Math.min(...values);

        // Cari Cmax.
        const max = Math.max(...values);

        debugLog(`${kriteria.label}: Cmin=${min}, Cmax=${max}, jenis=${kriteria.isBenefit ? 'Benefit' : 'Cost'}`);

        for (const id of siswaIds) {
            const nilaiRaw = rawValuesByStudent[id]?.[kriteria.key] ?? 0;

            normalizations[id] = normalizations[id] || {};

            normalizations[id][kriteria.key] = {
                nilaiRaw,

                nilaiNormalisasi: normalizeValue(nilaiRaw, min, max, kriteria.isBenefit),

                cMin: min,
                cMax: max,

                jenis: kriteria.isBenefit ? 'benefit' : 'cost',

                bobot: kriteria.bobot,
            };
        }
    }

    return normalizations;
};

// ============================================================
// SIMPAN NILAI KRITERIA KE DATABASE
// ============================================================
//

const saveNilaiKriteria = async ({ siswaList, tahunAjaranId, normalizations, kriteriaDbMap, scope }) => {
    const rows = siswaList.flatMap((siswa) =>
        KRITERIA_CONFIG.flatMap((kriteria) => {
            const kriteriaId = kriteriaDbMap[kriteria.key];

            if (!kriteriaId) {
                return [];
            }

            const nilaiData = normalizations[siswa.id]?.[kriteria.key];

            if (!nilaiData) {
                return [];
            }

            const { nilaiRaw, nilaiNormalisasi } = nilaiData;

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

    const siswaIds = siswaList.map((siswa) => siswa.id);

    await prisma.$transaction([
        // Hapus hasil lama.
        prisma.nilaiKriteria.deleteMany({
            where: {
                siswaId: {
                    in: siswaIds,
                },
                tahunAjaranId,
                scope,
            },
        }),

        // Insert hasil baru.
        ...toChunks(rows, BATCH_SIZE).map((data) =>
            prisma.nilaiKriteria.createMany({
                data,
            }),
        ),
    ]);
};

// ============================================================
// SIMPAN RANKING KE DATABASE
// ============================================================

const saveRanking = async ({ siswaList, tahunAjaranId, normalizations, scope }) => {
    const rankings = siswaList
        .map((siswa) => {

            const nilaiAkhir = KRITERIA_CONFIG.reduce((sum, kriteria) => {
                const nilaiNormalisasi = normalizations[siswa.id]?.[kriteria.key]?.nilaiNormalisasi ?? 0;

                return sum + nilaiNormalisasi * kriteria.bobot;
            }, 0);

            return {
                siswaId: siswa.id,

                kelasId: siswa.kelasId,

                kelasIndukId: siswa.kelasIndukId ?? null,

                nilaiAkhir,
            };
        })
        // Urutkan nilai terbesar ke terkecil.
        .sort((a, b) => b.nilaiAkhir - a.nilaiAkhir)
        // Tentukan peringkat.
        .map((row, index) => ({
            ...row,
            tahunAjaranId,
            scope,
            peringkat: index + 1,
        }));

    const siswaIds = siswaList.map((siswa) => siswa.id);

    await prisma.$transaction([
        // Hapus ranking lama.
        prisma.ranking.deleteMany({
            where: {
                siswaId: {
                    in: siswaIds,
                },
                tahunAjaranId,
                scope,
            },
        }),

        // Simpan ranking baru.
        ...toChunks(rankings, BATCH_SIZE).map((data) =>
            prisma.ranking.createMany({
                data,
            }),
        ),
    ]);
};

// ============================================================
// SYNC TABEL KRITERIA
// ============================================================


const syncKriteriaDb = async () => {
    const kriteriaDbMap = {};

    for (const k of KRITERIA_CONFIG) {
        const existing = await prisma.kriteria.findFirst({
            where: {
                namaKriteria: k.label,
            },
        });

        if (existing) {
            await prisma.kriteria.update({
                where: {
                    id: existing.id,
                },

                data: {
                    bobot: k.bobot,

                    jenis: k.isBenefit ? 'benefit' : 'cost',
                },
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
// MAIN TRIGGER
// ============================================================

export const triggerHitungSMART = async ({ siswaId, tahunAjaranId } = {}) => {
    // Jika tidak ada parameter sama sekali,
    // tidak melakukan perhitungan.
    if (!siswaId && !tahunAjaranId) {
        return;
    }

    // ==========================================================
    // Jika hanya siswaId yang diberikan,
    // cari tahun ajarannya.
    // ==========================================================

    if (!tahunAjaranId) {
        const siswa = await prisma.siswa.findUnique({
            where: {
                id: siswaId,
            },

            select: {
                tahunAjaranId: true,
            },
        });

        tahunAjaranId = siswa?.tahunAjaranId;
    }

    if (!tahunAjaranId) {
        return;
    }

    // ==========================================================
    // AMBIL SEMUA SISWA PADA TAHUN AJARAN
    // ==========================================================

    const siswaRaw = await prisma.siswa.findMany({
        where: {
            tahunAjaranId,
        },

        select: {
            id: true,
            kelasId: true,

            kelas: {
                select: {
                    kelasIndukId: true,
                },
            },
        },
    });

    if (siswaRaw.length === 0) {
        return;
    }

    // ==========================================================
    // RATAKAN STRUKTUR DATA SISWA
    // ==========================================================

    const siswaList = siswaRaw.map((siswa) => ({
        id: siswa.id,

        kelasId: siswa.kelasId,

        kelasIndukId: siswa.kelas?.kelasIndukId ?? null,
    }));

    const siswaIds = siswaList.map((siswa) => siswa.id);

    debugLog(`${siswaList.length} siswa dimuat`);

    // ==========================================================
    // SYNC KRITERIA
    // ==========================================================

    const kriteriaDbMap = await timed('sync tabel Kriteria', () => syncKriteriaDb());

    // ==========================================================
    // AMBIL RAW VALUES
    // ==========================================================

    const rawValues = await timed('ambil raw values (6 query)', () =>
        buildRawValuesForStudents(siswaIds, tahunAjaranId),
    );

    // ==========================================================
    // RANKING ANGKATAN
    // ==========================================================

    const siswaByKelasInduk = siswaList.reduce((acc, siswa) => {
        if (!siswa.kelasIndukId) {
            return acc;
        }

        acc[siswa.kelasIndukId] = acc[siswa.kelasIndukId] || [];

        acc[siswa.kelasIndukId].push(siswa);

        return acc;
    }, {});

    const angkatanGroups = Object.values(siswaByKelasInduk);

    for (const [gi, angkatanSiswaList] of angkatanGroups.entries()) {
        const tag = `ANGKATAN ${gi + 1}/${angkatanGroups.length} (${angkatanSiswaList.length} siswa)`;

        const angkatanSiswaIds = angkatanSiswaList.map((siswa) => siswa.id);

        // Normalisasi berdasarkan kelompok angkatan.
        const angkatanNormalizations = buildNormalizations(rawValues, angkatanSiswaIds);

        // Simpan nilai normalisasi.
        await timed(`${tag} simpan NilaiKriteria`, () =>
            saveNilaiKriteria({
                siswaList: angkatanSiswaList,

                tahunAjaranId,

                normalizations: angkatanNormalizations,

                kriteriaDbMap,

                scope: 'ANGKATAN',
            }),
        );

        // Hitung dan simpan ranking.
        await timed(`${tag} simpan Ranking`, () =>
            saveRanking({
                siswaList: angkatanSiswaList,

                tahunAjaranId,

                normalizations: angkatanNormalizations,

                scope: 'ANGKATAN',
            }),
        );
    }

    // ==========================================================
    // RANKING KELAS
    // ==========================================================

    const siswaByKelas = siswaList.reduce((acc, siswa) => {
        if (!siswa.kelasId) {
            return acc;
        }

        acc[siswa.kelasId] = acc[siswa.kelasId] || [];

        acc[siswa.kelasId].push(siswa);

        return acc;
    }, {});

    const kelasGroups = Object.values(siswaByKelas);

    for (const [gi, kelasSiswaList] of kelasGroups.entries()) {
        const tag = `KELAS ${gi + 1}/${kelasGroups.length} (${kelasSiswaList.length} siswa)`;

        const kelasSiswaIds = kelasSiswaList.map((siswa) => siswa.id);

        // Normalisasi berdasarkan kelas.
        const kelasNormalizations = buildNormalizations(rawValues, kelasSiswaIds);

        // Simpan nilai kriteria.
        await timed(`${tag} simpan NilaiKriteria`, () =>
            saveNilaiKriteria({
                siswaList: kelasSiswaList,

                tahunAjaranId,

                normalizations: kelasNormalizations,

                kriteriaDbMap,

                scope: 'KELAS',
            }),
        );

        // Hitung dan simpan ranking.
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
