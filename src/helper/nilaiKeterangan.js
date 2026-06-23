export const getKeterangan = (nilai) => {
    if (nilai >= 90) return 'Sangat Baik';
    if (nilai >= 80) return 'Baik';
    if (nilai >= 70) return 'Cukup';
    if (nilai >= 50) return 'Buruk';
    return 'Sangat Buruk';
};
