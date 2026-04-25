import {
    addPertemuan,
    deletePertemuan,
    getAllPertemuan,
    getOnePertemuan,
    getPertemuanByTahunAjaranAndKelas,
    updatePertemuan,
} from '../services/pertemuanService.js';

export const createPertemuan = async (req, res) => {
    try {
        const { kelasId } = req.params;
        const { tahunAjaranId, tanggal, namaPertemuan } = req.body;

        const pertemuans = await addPertemuan({
            tahunAjaranId,
            tanggal,
            namaPertemuan,
            kelasId,
        });

        res.status(200).json({ message: 'Data pertemuan berhasil ditambah', data: pertemuans });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const modifyPertemuan = async (req, res) => {
    try {
        const { id } = req.params;
        const { kelasId, tahunAjaranId, tanggal, namaPertemuan } = req.body;
        const pertemuans = await updatePertemuan(id, {
            tahunAjaranId,
            kelasId,
            tanggal,
            namaPertemuan,
        });

        res.status(200).json({
            message: 'Data pertemuan berhasil diubah',
            data: pertemuans,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const seeAllPertemuan = async (req, res) => {
    try {
        const pertemuans = await getAllPertemuan();
        res.status(200).json({
            message: 'Berhasil ambil data pertemuan',
            data: pertemuans,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const seeOnePertemuan = async (req, res) => {
    try {
        const { id } = req.params;
        const pertemuans = await getOnePertemuan(id);
        res.status(200).json({
            message: 'Berhasil ambil data pertemuan by id',
            data: pertemuans,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const removePertemuan = async (req, res) => {
    try {
        const { id } = req.params;
        await deletePertemuan(id);
        res.status(200).json({ message: 'Data pertemuan berhasil dihapus' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const seeAllPertemuanByTahunAndKelas = async (req, res) => {
    try {
        const { tahunAjaranId, kelasId } = req.params;
        const pertemuans = await getPertemuanByTahunAjaranAndKelas(tahunAjaranId, kelasId);
        res.status(200).json({
            message: 'Berhasil ambil data pertemuan by tahun dan kelas',
            dara: pertemuans,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
