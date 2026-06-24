import { inputHafalan } from '../services/hafalanService.js';

export const simpanHafalan = async (req, res) => {
    try {
        const { siswaId } = req.query;
        const { jumlahJuz, keterangan } = req.body;
        const result = await inputHafalan({ siswaId, jumlahJuz, keterangan });
        res.status(200).json({
            message: 'Berhasil Simpan Hafalan',
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
