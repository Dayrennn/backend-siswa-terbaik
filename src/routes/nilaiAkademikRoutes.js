import express from 'express';
import { simpanNilaiAkademik } from '../controllers/nilaiAkademikController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/:tahunAjaranId/:kelasId', authMiddleware, simpanNilaiAkademik);

export default router;
