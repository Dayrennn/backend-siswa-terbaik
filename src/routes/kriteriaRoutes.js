import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import {
    createKriteria,
    getKriteriaById,
    modifyKriteria,
    getAllKriteria,
    removeKriteria,
} from '../controllers/kriteriaController.js';

const router = express.Router();

router.post(
    '/create',
    authMiddleware,
    authorizeRole('Admin', 'WakilKepalaSekolah'),
    createKriteria,
);

router.put(
    '/update/:id',
    authMiddleware,
    authorizeRole('Admin', 'WakilKepalaSekolah'),
    modifyKriteria,
);

router.get('/', authMiddleware, getAllKriteria);

router.get('/:id', authMiddleware, getKriteriaById);

router.delete(
    '/delete/:id',
    authMiddleware,
    authorizeRole('Admin', 'WakilKepalaSekolah'),
    removeKriteria,
);

export default router;
