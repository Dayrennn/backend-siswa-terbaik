import {
  addKehadiran,
  updateKehadiran,
  getAllKehadiran,
  getKehadiranRekap,
  getOneKehadiran,
} from "../services/kehadiranService.js";

export const createKehadiran = async (req, res) => {
  try {
    const { tahunAjaran, statusKehadiran, tanggalKehadiran } = req.body;
    await addKehadiran({ tahunAjaran, statusKehadiran, tanggalKehadiran });
    res.status(200).json({ message: "Data kehadiran berhasil ditambah" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const modifyKehadiran = async (req, res) => {
  try {
    const { id } = req.params;
    const { tahunAjaran, statusKehadiran, tanggalKehadiran } = req.body;
    const updatedKehadiran = await updateKehadiran(id, {
      tahunAjaran,
      statusKehadiran,
      tanggalKehadiran,
    });
    res
      .status(200)
      .json({ message: "Data berhasil disimpan", data: updatedKehadiran });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const seeAllKehadiran = async (req, res) => {
  try {
    const kehadirans = await getAllKehadiran();
    res
      .status(200)
      .json({ message: "Berhasil ambil data kehadiran", data: kehadirans });
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
    res.status(200).json({ message: "Data kehadiran", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getKehadiranById = async (req, res) => {
  try {
    const { id } = req.params;
    const kehadirans = await getOneKehadiran();
    res.status(200).json({
      message: "Berhasil ambil data kehadiran by id",
      data: kehadirans,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
