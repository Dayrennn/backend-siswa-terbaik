import { inputNilaiEskul } from "../services/nilaiEskulService.js";

export const inputNilaiEskulController = async (req, res) => {
    try {
        const { eskulId, tahunAjaranId, nilaiSiswa } = req.body;
        const result = await inputNilaiEskul({ eskulId, tahunAjaranId, nilaiSiswa });
        res.status(200).json({
            message: 'Berhasil input nilai eskul',
            data: result,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};