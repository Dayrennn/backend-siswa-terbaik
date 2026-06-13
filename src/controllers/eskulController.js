import { addEskul, deleteEskul, getAllEskul, updateEskul } from '../services/eskulService.js';

export const createEskul = async (req, res) => {
    try {
        const { namaEskul } = req.body;
        const result = await addEskul({ namaEskul });
        res.status(200).json({
            message: 'Berhasil Menambahkan Eskul',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeAllEskul = async (req, res) => {
    try {
        const result = await getAllEskul();
        res.status(200).json({
            message: 'Berhasil Mengambil Semua Data Eskul',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const modifyEskul = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaEskul } = req.body;
        const result = await updateEskul({ id, namaEskul });
        res.status(200).json({
            message: 'Berhasil Merubah Data Eskul',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const removeEskul = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteEskul(id);
        res.status(200).json({
            message: 'Berhasil Hapus Data Eskul',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
