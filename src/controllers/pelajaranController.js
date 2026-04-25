import {
    addPelajaran,
    updatePelajaran,
    getAllPelajaran,
    getOnePelajaran,
    deletePelajaran,
} from '../services/pelajaranService.js';

export const createPelajaran = async (req, res) => {
    try {
        const { namaPelajaran, kodePelajaran } = req.body;
        await addPelajaran({ namaPelajaran, kodePelajaran });
        res.status(200).json({ message: 'Data pelajaran berhasil ditambah' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const modifyPelajaran = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaPelajaran, kodePelajaran } = req.body;
        const updatedPelajaran = await updatePelajaran(id, {
            namaPelajaran,
            kodePelajaran,
        });
        res.status(200).json({ message: 'Data berhasil disimpan', data: updatedPelajaran });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const seeAllPelajaran = async (req, res) => {
    try {
        const pelajarans = await getAllPelajaran();
        res.status(200).json({ message: 'Berhasil ambil data pelajaran', data: pelajarans });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getPelajaranById = async (req, res) => {
    try {
        const { id } = req.params;
        const pelajarans = await getOnePelajaran(id);
        res.status(200).json({
            message: 'Berhasil mengambil data pelajaran by id',
            data: pelajarans,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removePelajaran = async (req, res) => {
    try {
        const { id } = req.params;
        const pelajarans = await deletePelajaran(id);
        res.status(200).json({
            message: 'Berhasil hapus data pelajaran',
            data: pelajarans,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
