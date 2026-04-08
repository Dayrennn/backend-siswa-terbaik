import {
  addTahunAjaran,
  updateTahunAjaran,
  getAllTahunAjaran,
  getOneTahunAjaran,
  deleteTahunAjaran,
} from "../services/tahunAjaran.js";

export const createTahunAjaran = async (req, res) => {
  try {
    const { namaTahunAjaran, status } = req.body;
    await addTahunAjaran({ namaTahunAjaran, status });
    res.status(200).json({
      message: "Data tahun ajaran berhasil ditambah",
      data: { namaTahunAjaran, status },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const modidyTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaTahunAjaran, status } = req.body;
    await updateTahunAjaran(id, { namaTahunAjaran, status });
    res.status(200).json({
      message: "Data tahun ajaran berhasil diubah",
      data: { id, namaTahunAjaran, status },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const seeAllTahunAjaran = async (req, res) => {
  try {
    const tahunAjarans = await getAllTahunAjaran();
    res.status(200).json({
      message: "Berhasil ambil data tahun ajaran",
      data: tahunAjarans,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTahunAjaranById = async (req, res) => {
  try {
    const { id } = req.params;
    const tahunAjarans = await getOneTahunAjaran(id);
    res.status(200).json({
      message: "Data tahun ajaran berhasil diambil",
      data: tahunAjarans,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTahunAjaran(id);
    res.status(200).json({ message: "Data tahun ajaran berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
