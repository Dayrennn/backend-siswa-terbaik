import express from 'express';
import {
    createPelajaran,
    modifyPelajaran,
    seeAllPelajaran,
    getPelajaranById,
    removePelajaran,
} from '../controllers/pelajaranController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin'), createPelajaran);
router.put('/update/:id', authMiddleware, authorizeRole('Admin'), modifyPelajaran);
router.get('/', authMiddleware, seeAllPelajaran);
router.get('/:id', authMiddleware, getPelajaranById);

router.delete(
    '/delete/:id',
    authMiddleware,
    authorizeRole('Admin', 'WakilKepalaSekolah'),
    removePelajaran,
);

export default router;
