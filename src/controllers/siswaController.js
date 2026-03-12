import { addSiswa, updateSiswa } from "../services/siswaServices.js";

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
    const updateSiswa = updateSiswa(id, {
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
