import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { authorizeWaliKelasScope } from '../middleware/academicScopeMiddleware.js';

import { createPoinMinus, deletePoinMinus, editPoinMinus } from '../controllers/poinMinusController.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah', 'WaliKelas'), authorizeWaliKelasScope, createPoinMinus);
router.put('/update/:id', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah', 'WaliKelas'), authorizeWaliKelasScope, editPoinMinus);
router.delete(
    '/delete/:id',
    authMiddleware,
    authorizeRole('Admin', 'WakilKepalaSekolah', 'WaliKelas'),
    authorizeWaliKelasScope,
    deletePoinMinus,
);

export default router;
