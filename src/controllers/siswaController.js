import {
  addSiswa,
  getAllSiswa,
  getOneSiswa,
  updateSiswa,
  deleteSiswa,
  getSiswaByTahunAjaran,
} from "../services/siswaServices.js";

export const createSiswa = async (req, res) => {
  try {
    const { tahunAjaranId } = req.params;
    const { nis, namaSiswa, tanggalLahir, kelas, nilai, pelajaranId } =
      req.body;
    await addSiswa({
      nis,
      namaSiswa,
      tanggalLahir,
      kelas,
      nilai,
      pelajaranId,
      tahunAjaranId,
    });

    res.status(200).json({ message: "Data siswa berhasil ditambah" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const modifySiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nis, namaSiswa, tanggalLahir, kelas, nilai, pelajaranId } =
      req.body;
    const updatedSiswa = await updateSiswa(id, {
      nis,
      namaSiswa,
      tanggalLahir,
      kelas,
      nilai,
      pelajaranId,
      tahunAjaranId: req.body.tahunAjaranId,
    });
    res
      .status(200)
      .json({ message: "Data berhasil dirubah", data: updatedSiswa });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const seeAllSiswa = async (req, res) => {
  try {
    const siswas = await getAllSiswa();
    res
      .status(200)
      .json({ message: "Berhasil ambil data siswa", data: siswas });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;
    const siswas = await getOneSiswa(id);
    res
      .status(200)
      .json({ message: "Berhasil mengambil data siswa by id", data: siswas });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const siswas = await deleteSiswa(id);
    res
      .status(200)
      .json({ message: "Data siswa berhasil dihapus", data: siswas });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const seeAllSiswaByTahunAjaran = async (req, res) => {
  try {
    const { tahunAjaranId } = req.params;
    const siswas = await getSiswaByTahunAjaran(tahunAjaranId);
    res.status(200).json({
      message: "Berhasil ambil data siswa by tahun ajaran",
      data: siswas,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
