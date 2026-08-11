import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { inputNilaiEskulController } from '../controllers/nilaiEskulController.js';
import { authorizeWaliKelasScope } from '../middleware/academicScopeMiddleware.js';

const router = express.Router();

router.post(
    '/simpan/:siswaId/nilai-eskul/:eskulId',
    authMiddleware,
    authorizeRole('Admin', 'Guru', 'WaliKelas'),
    authorizeWaliKelasScope,
    inputNilaiEskulController,
);

export default router;
