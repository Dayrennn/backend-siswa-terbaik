import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { simpanNilaiRekap } from '../controllers/nilaiRekapController.js';

const router = express.Router();

router.post('/simpan/:siswaId/nilai-rekap/:pelajaranId', authMiddleware, simpanNilaiRekap);

export default router;
