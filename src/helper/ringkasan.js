
export const hitungRingkasan = (siswa) => {
    const totalNilaiRekap = siswa.nilaiRekap.reduce((sum, n) => sum + n.nilaiAkhir, 0);
    const rataRataNilai = siswa.nilaiRekap.length > 0 ? totalNilaiRekap / siswa.nilaiRekap.length : 0;

    const nilaiKriteriaAngkatan = siswa.nilaiKriteria.filter((nk) => !nk.scope || nk.scope === 'ANGKATAN');
    const totalBobot = nilaiKriteriaAngkatan.reduce((sum, nk) => sum + nk.kriteria.bobot, 0);
    const totalNilaiKriteriaBerbobot = nilaiKriteriaAngkatan.reduce(
        (sum, nk) => sum + nk.nilaiNormalisasi * nk.kriteria.bobot,
        0,
    );
    const rataRataNilaiKriteria = totalBobot > 0 ? totalNilaiKriteriaBerbobot / totalBobot : 0;

    // rekap kehadiran dari absenRekap (akumulasi semua pelajaran)
    const rekapKehadiran = siswa.absenRekap.reduce(
        (acc, a) => {
            acc.totalPertemuan += a.totalPertemuan;
            acc.hadir += a.totalHadir;
            acc.sakit += a.totalSakit;
            acc.izin += a.totalIzin;
            acc.alpha += a.totalAlpha;
            return acc;
        },
        { totalPertemuan: 0, hadir: 0, sakit: 0, izin: 0, alpha: 0 },
    );

    const persentaseHadir =
        rekapKehadiran.totalPertemuan > 0 ? (rekapKehadiran.hadir / rekapKehadiran.totalPertemuan) * 100 : 0;

    return {
        rataRataNilai: parseFloat(rataRataNilai.toFixed(2)),
        rataRataNilaiKriteria: parseFloat(rataRataNilaiKriteria.toFixed(2)),
        rekapKehadiran,
        persentaseHadir: parseFloat(persentaseHadir.toFixed(2)),
    };
};

// hitung rata rata nilai
export const hitungRataRataNilai = (nilaiRekap = []) => {
    const total = nilaiRekap.reduce(
        (sum, n) => sum + Number(n.nilaiAkhir || 0),
        0
    );

    return nilaiRekap.length > 0
        ? parseFloat((total / nilaiRekap.length).toFixed(2))
        : 0;
};

// hitung rata rata nilai kriteria
export const hitungRataRataNilaiKriteria = (nilaiKriteria = []) => {
    const nilaiKriteriaAngkatan = nilaiKriteria.filter(
        (nk) => !nk.scope || nk.scope === 'ANGKATAN'
    );

    const totalBobot = nilaiKriteriaAngkatan.reduce(
        (sum, nk) => sum + Number(nk.kriteria?.bobot || 0),
        0
    );

    const totalNilaiKriteriaBerbobot = nilaiKriteriaAngkatan.reduce(
        (sum, nk) =>
            sum +
            Number(nk.nilaiNormalisasi || 0) *
            Number(nk.kriteria?.bobot || 0),
        0
    );

    return totalBobot > 0
        ? parseFloat(
              (totalNilaiKriteriaBerbobot / totalBobot).toFixed(2)
          )
        : 0;
};

// hitung rekap kehadiran
export const hitungRekapKehadiran = (absenRekap = []) => {
    return absenRekap.reduce(
        (acc, a) => {
            acc.totalPertemuan += Number(a.totalPertemuan || 0);
            acc.hadir += Number(a.totalHadir || 0);
            acc.sakit += Number(a.totalSakit || 0);
            acc.izin += Number(a.totalIzin || 0);
            acc.alpha += Number(a.totalAlpha || 0);

            return acc;
        },
        {
            totalPertemuan: 0,
            hadir: 0,
            sakit: 0,
            izin: 0,
            alpha: 0,
        }
    );
};

// presentase kehadiran
export const hitungPersentaseKehadiran = (
    totalHadir,
    totalPertemuan
) => {
    if (!totalPertemuan) return 0;

    return parseFloat(
        ((totalHadir / totalPertemuan) * 100).toFixed(2)
    );
};

// total poin plus
export const hitungTotalPoinPlus = (poinPlus = []) => {
    return poinPlus.reduce(
        (total, item) => total + Number(item.poin || 0),
        0
    );
};

// total poin minus
export const hitungTotalPoinMinus = (poinMinus = []) => {
    return poinMinus.reduce(
        (total, item) => total + Number(item.poin || 0),
        0
    );
};

// poin perilaku
export const hitungPoinPerilaku = (
    totalPoinPlus,
    totalPoinMinus
) => {
    return Number(totalPoinPlus || 0) - Number(totalPoinMinus || 0);
};