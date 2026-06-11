import { addPoin, removePoinPlus, updatePoin } from '../services/poinPlusService.js';

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

export const editPoinPlus = async (req, res) => {
    try {
        const { id } = req.params;
        const { deskripsi, poin, tanggal } = req.body;
        const result = await updatePoin({ id, deskripsi, poin, tanggal });
        res.status(200).json({
            message: 'Berhasil Update Poin Plus',
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePoinPlus = async (req, res) => {
    try {
        const { id } = req.params;
        await removePoinPlus(id);
        res.status(200).json({
            message: 'Berhasil Menghapus Poin Plus',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
