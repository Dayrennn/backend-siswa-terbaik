import { inputNilaiRekap } from '../services/nilaiRekapService.js';

export const simpanNilaiRekap = async (req, res) => {
    try {
        const { siswaId, pelajaranId } = req.params;
        const { kelasId, nilaiTugas, nilaiUH, nilaiUTS, nilaiUAS, nilaiAkhir } = req.body;
        const result = await inputNilaiRekap({
            siswaId,
            pelajaranId,
            kelasId,
            nilaiTugas,
            nilaiUH,
            nilaiUTS,
            nilaiUAS,
            nilaiAkhir,
        });
        res.status(200).json({
            message: 'Berhasil Simpan Data Nilai',
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
