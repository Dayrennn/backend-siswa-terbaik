export const getNilaiHafalan = (jumlahJuz) => {
    if (jumlahJuz >= 6) return 100; // > 5 Juz
    if (jumlahJuz === 5) return 90; // 5 Juz
    if (jumlahJuz === 4) return 80; // 4 Juz
    if (jumlahJuz === 3) return 75; // 3 Juz
    if (jumlahJuz === 2) return 70; // 2 Juz
    if (jumlahJuz === 1) return 65; // 1 Juz (tepat 1 juz)
    return 60; // < 1 Juz
};
