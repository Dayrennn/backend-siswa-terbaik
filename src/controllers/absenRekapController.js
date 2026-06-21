import { inputAbsenRekap } from '../services/absenRekapService.js';

export const simpanAbsenRekap = async (req, res) => {
    try {
        const { siswaId, pelajaranId } = req.params;
        const { kelasId, totalPertemuan, totalHadir, totalSakit, totalIzin, totalAlpha } = req.body;
        const result = await inputAbsenRekap({
            siswaId,
            pelajaranId,
            kelasId,
            totalPertemuan,
            totalHadir,
            totalSakit,
            totalIzin,
            totalAlpha,
        });

        res.status(200).json({
            message: 'Berhasil Simpan Data Absen',
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
