import express from 'express';
import { simpanNilaiAkademik } from '../controllers/nilaiAkademikController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:tahunAjaranId/:kelasId', authMiddleware, simpanNilaiAkademik);

export default router;
