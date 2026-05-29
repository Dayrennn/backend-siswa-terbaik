import {
    addKehadiran,
    updateKehadiran,
    getAllKehadiran,
    getKehadiranRekap,
    getOneKehadiran,
    getKehadiranByPertemuan,
} from '../services/kehadiranService.js';

export const createKehadiran = async (req, res) => {
    try {
        const { pertemuanId, tahunAjaranId, kelasId } = req.params;
        const { siswaId, statusKehadiran, tanggalKehadiran } = req.body;
        const result = await addKehadiran({
            siswaId,
            tahunAjaranId,
            kelasId,
            statusKehadiran,
            tanggalKehadiran,
            pertemuanId,
        });
        res.status(200).json({ message: 'Data kehadiran berhasil ditambah', data: result });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const modifyKehadiran = async (req, res) => {
    try {
        const { kelasId, pertemuanId } = req.params;
        const { siswaId, statusKehadiran } = req.body;
        const result = await updateKehadiran({
            kelasId,
            pertemuanId,
            siswaId,
            statusKehadiran,
        });
        res.status(200).json({ message: 'Data berhasil di Update', data: result });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const seeAllKehadiran = async (req, res) => {
    try {
        const kehadirans = await getAllKehadiran();
        res.status(200).json({ message: 'Berhasil ambil data kehadiran', data: kehadirans });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getKehadiranByFilter = async (req, res) => {
    try {
        const { siswaId, tahunAjaran, kelas } = req.query;
        const data = await getKehadiranRekap({
            siswaId,
            tahunAjaran,
            kelas,
        });
        res.status(200).json({ message: 'Data kehadiran', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getKehadiranById = async (req, res) => {
    try {
        const { id } = req.params;
        const kehadirans = await getOneKehadiran();
        res.status(200).json({
            message: 'Berhasil ambil data kehadiran by id',
            data: kehadirans,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAbsenByPertemuan = async (req, res) => {
    try {
        const { tahunAjaranId, pertemuanId, kelasId } = req.params;
        const kehadirans = await getKehadiranByPertemuan({ tahunAjaranId, pertemuanId, kelasId });
        res.status(200).json({
            message: 'Berhasil ambil data kehadiran by pertemuan',
            data: kehadirans,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// kehadiran.controller.js
export const getKehadiranTab = async (req, res) => {
    try {
        const { kelasId, tahunAjaranId, tanggal } = req.query;
        const data = await getKehadiranByKelasAndTanggal({
            kelasId,
            tahunAjaranId,
            tanggal: tanggal ?? new Date().toISOString(), // default hari ini
        });
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const simpanKehadiran = async (req, res) => {
    try {
        const { kelasId, tahunAjaranId, tanggal, kehadiran } = req.body;
        const data = await inputKehadiranKelas({ kelasId, tahunAjaranId, tanggal, kehadiran });
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};