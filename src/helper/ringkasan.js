
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
