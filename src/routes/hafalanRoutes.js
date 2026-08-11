import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { authorizeWaliKelasScope } from '../middleware/academicScopeMiddleware.js';
import { simpanHafalan } from '../controllers/hafalanController.js';

const router = express.Router();

router.post('/simpan', authMiddleware, authorizeRole('Admin', 'WaliKelas', 'WakilKepalaSekolah'), authorizeWaliKelasScope, simpanHafalan);

export default router;
