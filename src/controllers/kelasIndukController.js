import { getKelasInduk } from '../services/kelasIndukService.js';

export const seeAllKelasInduk = async (req, res) => {
    try {
        const data = await getKelasInduk();
        res.status(200).json({
            message: 'Berhasil Ambil Data Kelas Induk',
            data,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
