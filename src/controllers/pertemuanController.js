import { addPertemuan } from "../services/pertemuanService.js";

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

    res
      .status(200)
      .json({ message: "Data pertemuan berhasil ditambah", data: pertemuans });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
