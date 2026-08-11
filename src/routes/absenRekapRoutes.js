import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { simpanAbsenRekap } from '../controllers/absenRekapController.js';
import { authorizeGuruPelajaranScope, authorizeWaliKelasScope } from '../middleware/academicScopeMiddleware.js';

const router = express.Router();

router.post(
    '/simpan/:siswaId/:pelajaranId',
    authMiddleware,
    authorizeRole('Admin', 'Guru', 'WaliKelas', 'WakilKepalaSekolah'),
    authorizeGuruPelajaranScope,
    authorizeWaliKelasScope,
    simpanAbsenRekap,
);

export default router;
