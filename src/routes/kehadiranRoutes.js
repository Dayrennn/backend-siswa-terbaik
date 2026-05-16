import express from 'express';
import {
    createKehadiran,
    modifyKehadiran,
    seeAllKehadiran,
    getKehadiranByFilter,
    getKehadiranById,
    getAbsenByPertemuan,
} from '../controllers/kehadiranController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

const router = express.Router();
router.post(
    '/create/:tahunAjaranId/:kelasId/absen/:pertemuanId',
    authMiddleware,
    authorizeRole('Admin', 'Guru', 'WaliKelas'),
    createKehadiran,
);
router.put(
    '/update/:tahunAjaranId/:kelasId/absen/:pertemuanId',
    authMiddleware,
    authorizeRole('Admin', 'WakilKepalaSekolah'),
    modifyKehadiran,
);
router.get('/', authMiddleware, seeAllKehadiran);
router.get("/:tahunAjaranId/:kelasId/absen/:pertemuanId", authMiddleware, getAbsenByPertemuan)
router.get('/rekap', authMiddleware, getKehadiranByFilter);
router.get('/:id', authMiddleware, getKehadiranById);

export default router;
