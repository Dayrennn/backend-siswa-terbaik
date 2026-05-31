import { inputNilaiAkademik } from '../services/nilaiAkademikService';

export const simpanNilaiAkademik = async (req, res) => {
    try {
        const { tahunAjaranId, kelasId } = req.params;
        const { pelajaranId, jenis, nilaiSiswa } = req.body;
        const result = await inputNilaiAkademik({ kelasId, tahunAjaranId, pelajaranId, jenis, nilaiSiswa });
        res.status(200).json({
            message: 'Berhasil Input Nilai Akademik',
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
