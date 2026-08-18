import {
    addSiswa,
    getAllSiswa,
    getOneSiswa,
    updateSiswa,
    deleteSiswa,
    getSiswaByTahunAjaran,
    getSiswaByTahunAjaranAndKelas,
    getSiswaByEskul,
    getSiswaByHafalan,
    getRankingAngkatan,
    getRankingKelas,
    getSiswaByHafalanId,
    getAllNilaiSiswaById,
    getOneSiswaAbsen,
    getSiswaByHafalanParams,
} from '../services/siswaServices.js';

export const createSiswa = async (req, res) => {
    try {
        const { nis, namaSiswa, tanggalLahir, kelasId, tahunAjaranId } = req.body;
        const siswas = await addSiswa({
            nis,
            namaSiswa,
            tanggalLahir,
            kelasId,
            tahunAjaranId,
        });

        res.status(200).json({ message: 'Data siswa berhasil ditambah', data: siswas });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const modifySiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nis, namaSiswa, tanggalLahir, kelasId, tahunAjaranId, eskulId } = req.body;
        const updatedSiswa = await updateSiswa(id, {
            nis,
            namaSiswa,
            tanggalLahir,
            kelasId,
            tahunAjaranId,
            eskulId,
        });
        res.status(200).json({ message: 'Data berhasil dirubah', data: updatedSiswa });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const seeAllSiswa = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { search = '' } = req.query;

        const siswas = await getAllSiswa(page, limit, search);
        res.status(200).json({ message: 'Berhasil ambil data siswa', data: siswas });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getSiswaById = async (req, res) => {
    try {
        const { id } = req.params;
        const siswas = await getOneSiswa(id);
        res.status(200).json({ message: 'Berhasil mengambil data siswa by id', data: siswas });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeSiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const siswas = await deleteSiswa(id);
        res.status(200).json({ message: 'Data siswa berhasil dihapus', data: siswas });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const seeAllSiswaByTahunAjaran = async (req, res) => {
    try {
        const { tahunAjaranId } = req.params;
        const siswas = await getSiswaByTahunAjaran(tahunAjaranId);
        res.status(200).json({
            message: 'Berhasil ambil data siswa by tahun ajaran',
            data: siswas,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const seeAllSiswaByTahunAjaranAndKelas = async (req, res) => {
    try {
        const { tahunAjaranId, kelasId } = req.params;
        const siswas = await getSiswaByTahunAjaranAndKelas({ tahunAjaranId, kelasId });
        res.status(200).json({
            message: 'Berhasil ambil data siswa by tahun ajaran dan kelas',
            data: siswas,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const seeAllSiswaByEskul = async (req, res) => {
    try {
        const { eskulId } = req.params;
        const { tahunAjaranId } = req.query;
        const siswas = await getSiswaByEskul({ tahunAjaranId, eskulId });
        res.status(200).json({
            message: 'Berhasil ambil data siswa by eskul',
            data: siswas,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeAllSiswaHafalan = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { search = '' } = req.query;

        const result = await getSiswaByHafalan(page, limit, search);
        res.status(200).json({
            message: 'Berhasil ambil data siswa by hafalan',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeRankingAngkatan = async (req, res) => {
    try {
        const { tahunAjaranId, kelasIndukId } = req.query;

        if (!tahunAjaranId || !kelasIndukId) {
            throw new Error('tahunAjaranId dan kelasIndukId wajib diisi');
        }

        const data = await getRankingAngkatan({ tahunAjaranId, kelasIndukId });
        res.status(200).json({ message: 'Ranking angkatan berhasil diambil', data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const seeRankingKelas = async (req, res) => {
    try {
        const { tahunAjaranId, kelasId } = req.query;
        const limit = parseInt(req.query.limit) || 10;
        if (!tahunAjaranId || !kelasId) {
            throw new Error('tahunAjaranId dan kelasId wajib diisi');
        }
        const result = await getRankingKelas({ tahunAjaranId, kelasId, limit });
        res.status(200).json({
            message: 'Berhasil ambil ranking kelas',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getOneSiswaHafalan = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getSiswaByHafalanId(id);
        res.status(200).json({
            message: 'Berhasil ambil siswa dengan hafalan',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeOneSiswaHafalanParams = async (req, res) => {
    try {
        const { kelasId, tahunAjaranId, siswaId } = req.params;
        const result = await getSiswaByHafalanParams({ kelasId, tahunAjaranId, siswaId });
        res.status(200).json({
            message: 'Berhasil ambil siswa dengan hafalan',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeOneNilaiSiswa = async (req, res) => {
    try {
        const { siswaId, tahunAjaranId, kelasId } = req.params;
        const result = await getAllNilaiSiswaById({ kelasId, siswaId, tahunAjaranId });
        res.status(200).json({
            message: 'Berhasil ambil nilai satu siswa',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeOneAbsenSiswa = async (req, res) => {
    try {
        const { tahunAjaranId, kelasId, siswaId } = req.params;
        const result = await getOneSiswaAbsen({ tahunAjaranId, kelasId, siswaId });
        res.status(200).json({
            message: 'Berhasil ambil absen satu siswa',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
