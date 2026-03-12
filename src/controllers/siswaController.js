import {
  addSiswa,
  getAllSiswa,
  getOneSiswa,
  updateSiswa,
} from "../services/siswaServices.js";

export const createSiswa = async (req, res) => {
  try {
    const { nis, name, tanggalLahir, kelas, nilai } = req.body;
    await addSiswa({ nis, name, tanggalLahir, kelas, nilai });
    res.status(200).json({ message: "Data siswa berhasil ditambah" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const modifySiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nis, name, tanggalLahir, kelas, nilai } = req.body;
    const updatedSiswa = updateSiswa(id, {
      nis,
      name,
      tanggalLahir,
      kelas,
      nilai,
    });
    res
      .status(200)
      .json({ message: "Data berhasil dirubah", data: updateSiswa });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const seeAllSiswa = async (req, res) => {
  try {
    const siswas = await getAllSiswa();
    res.status(200).json({ message: "Berhasil ambil data siswa" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;
    const siswa = await getOneSiswa(id);
    res.status(200).json({ message: "Berhasil mengambil data siswa by id" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
