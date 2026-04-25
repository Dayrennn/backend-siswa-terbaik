import {
    addKelas,
    updateKelas,
    getKelas,
    getOneKelas,
    deleteKelas,
} from '../services/kelasService.js';

export const createKelas = async (req, res) => {
    try {
        const { kodeKelas, namaKelas } = req.body;
        const addedKelas = await addKelas({ kodeKelas, namaKelas });
        res.status(200).json({ message: 'Data kelas berhasil ditambah', data: addedKelas });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const modifyKelas = async (req, res) => {
    try {
        const { id } = req.params;
        const { kodeKelas, namaKelas } = req.body;
        const updatedKelas = await updateKelas(id, {
            kodeKelas,
            namaKelas,
        });
        res.status(200).json({ message: 'Data berhasil diubah', data: updatedKelas });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllKelas = async (req, res) => {
    try {
        const kelas = await getKelas();
        res.status(200).json({
            message: 'Berhasl Mengambil Data Kelas',
            data: kelas,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getKelasById = async (req, res) => {
    try {
        const { id } = req.params;
        const kelas = await getOneKelas(id);
        res.status(200).json({ message: 'Berhasil Mengambil Data Kelas', data: kelas });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeKelas = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedKelas = await deleteKelas(id);
        res.status(200).json({ message: 'Data berhasil dihapus', data: deletedKelas });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
