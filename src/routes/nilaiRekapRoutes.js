import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { simpanNilaiRekap } from '../controllers/nilaiRekapController.js';
import { authorizeGuruPelajaranScope, authorizeWaliKelasScope } from '../middleware/academicScopeMiddleware.js';

const router = express.Router();

router.post(
    '/simpan/:siswaId/nilai-rekap/:pelajaranId',
    authMiddleware,
    authorizeRole('Admin', 'Guru', 'WaliKelas', 'WakilKepalaSekolah'),
    authorizeGuruPelajaranScope,
    authorizeWaliKelasScope,
    simpanNilaiRekap,
);

export default router;
