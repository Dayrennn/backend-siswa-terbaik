import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { inputNilaiEskulController } from '../controllers/nilaiEskulController.js';

const router = express.Router();

router.post('/simpan', authMiddleware, authorizeRole('Admin', 'Guru', 'WaliKelas'), inputNilaiEskulController);

export default router;
