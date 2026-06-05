import { addJadwal, updateJadwal, getJadwalByKelasAndTahunAjaran, deleteJadwal } from '../services/jadwalService.js';

export const createJadwal = async (req, res) => {
    try {
        const { pelajaranId, hari, jamMulai, jamSelesai, kelasId } = req.body;
        const jadwal = await addJadwal({ pelajaranId, hari, jamMulai, jamSelesai, kelasId });
        res.status(200).json({ message: 'Data jadwal berhasil ditambah', data: jadwal });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const modifyJadwal = async (req, res) => {
    try {
        const { id } = req.params;
        const { pelajaranId, hari, jamMulai, jamSelesai, kelasId } = req.body;
        const jadwal = await updateJadwal(id, { pelajaranId, hari, jamMulai, jamSelesai, kelasId });
        res.status(200).json({ message: 'Data jadwal berhasil diubah', data: jadwal });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getJadwalBykelasTahunAjaran = async (req, res) => {
    try {
        const { kelasId, tahunAjaranId } = req.query;
        const jadwal = await getJadwalByKelasAndTahunAjaran({ kelasId, tahunAjaranId });
        res.status(200).json({ message: 'Data jadwal berhasil diambil', data: jadwal });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeJadwal = async (req, res) => {
    try {
        const { id } = req.params;
        const jadwal = await deleteJadwal(id);
        res.status(200).json({ message: 'Data jadwal berhasil dihapus', data: jadwal });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}