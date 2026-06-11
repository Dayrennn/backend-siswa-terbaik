import { addPoin, removePoinMinus, updatePoin } from '../services/poinMinusService.js';

export const createPoinMinus = async (req, res) => {
    try {
        const { siswaId, deskripsi, poin, tanggal } = req.body;
        const result = await addPoin({ siswaId, deskripsi, poin, tanggal });
        res.status(200).json({
            message: `Berhasil menambahkan poin minus ke ${siswaId}`,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const editPoinMinus = async (req, res) => {
    try {
        const { id } = req.params;
        const { deskripsi, poin, tanggal } = req.body;
        const result = await updatePoin({ id, deskripsi, poin, tanggal });
        res.status(200).json({
            message: 'Berhasil Update Poin Minus',
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePoinMinus = async (req, res) => {
    try {
        const { id } = req.params;
        await removePoinMinus(id);
        res.status(200).json({
            message: 'Berhasil Menghapus Poin Minus',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
