import express from 'express';
import {
    createTahunAjaran,
    modidyTahunAjaran,
    seeAllTahunAjaran,
    getTahunAjaranById,
    removeTahunAjaran,
} from '../controllers/tahunAjaranController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, createTahunAjaran);

router.put('/update/:id', authMiddleware, modidyTahunAjaran);
router.get('/', authMiddleware, seeAllTahunAjaran);
router.get('/:id', authMiddleware, getTahunAjaranById);

router.delete('/delete/:id', authMiddleware, removeTahunAjaran);

export default router;
