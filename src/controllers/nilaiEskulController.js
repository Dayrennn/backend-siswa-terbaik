import { inputNilaiEskul } from '../services/nilaiEskulService.js';

export const inputNilaiEskulController = async (req, res) => {
    try {
        const { siswaId, eskulId } = req.params;
        const { kelasId, nilaiAkhir, totalPertemuan, totalHadir, totalIzin, totalSakit, totalAlpha } = req.body;
        const result = await inputNilaiEskul({
            siswaId,
            eskulId,
            nilaiAkhir,
            totalPertemuan,
            totalHadir,
            totalIzin,
            totalSakit,
            totalAlpha,
        });
        res.status(200).json({
            message: 'Berhasil input nilai eskul',
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};