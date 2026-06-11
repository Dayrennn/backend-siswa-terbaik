import { addPoin } from '../services/poinPlusService.js';

export const createPoinPlus = async (req, res) => {
    try {
        const { siswaId, deskripsi, poin, tanggal } = req.body;
        const result = await addPoin({ siswaId, deskripsi, poin, tanggal });
        res.status(200).json({
            message: `Berhasil menambahkan poin plus ke ${siswaId}`,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
