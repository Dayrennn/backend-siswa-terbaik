export const getKeterangan = (nilai) => {
    if (nilai >= 90) return 'Sangat Baik';
    if (nilai >= 80) return 'Baik';
    if (nilai >= 70) return 'Cukup';
    if (nilai >= 50) return 'Buruk';
    return 'Sangat Buruk';
};

export const getKeteranganHafalan = (jumlahJuz) => {
    if (jumlahJuz >= 30) return 'Khatam';
    if (jumlahJuz >= 15) return 'Istimewa';
    if (jumlahJuz >= 5) return 'Sangat Baik';
    if (jumlahJuz >= 4) return 'Baik';
    if (jumlahJuz >= 3) return 'Cukup';
    if (jumlahJuz >= 1) return 'Perlu Ditingkatkan';
    return 'Belum Mulai';
};