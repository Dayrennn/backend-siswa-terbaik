import {
  addKriteria,
  getAllKriteria,
  getOneKriteria,
  updateKriteria,
} from "../services/kriteriaService";

export const createKriteria = async (req, res) => {
  try {
    const { namaKriteria, bobot, jenis } = req.body;
    await addKriteria({ namaKriteria, bobot, jenis });
    res.status(200).json({ message: "Data kriteria berhasil ditambah" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const modifyKriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaKriteria, bobot, jenis } = req.body;
    const updatedKritera = updateKriteria(id, {
      namaKriteria,
      bobot,
      jenis,
    });
    res
      .status(200)
      .json({ message: "Data berhasil diubah", data: updatedKritera });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllKriteria = async (req, res) => {
  try {
    const kriterias = await getAllKriteria();
    res.status(200).json({
      message: "Berhasil mendapatkan data kriteria",
      data: kriterias,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getKriteriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const kriterias = await getOneKriteria(id);
    res
      .status(200)
      .json({ message: "berhasil mendapatkan data kriteria", data: kriterias });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
