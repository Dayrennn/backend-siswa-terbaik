import express from 'express';
import { createJadwal, getJadwalBykelasTahunAjaran, removeJadwal, modifyJadwal } from '../controllers/jadwalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin'), createJadwal);
router.get('/', authMiddleware, getJadwalBykelasTahunAjaran);
router.put('/update/:id', authMiddleware, authorizeRole('Admin'), modifyJadwal);
router.delete('/delete/:id', authMiddleware, authorizeRole('Admin'), removeJadwal);

export default router;