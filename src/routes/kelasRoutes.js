import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

import {
    createKelas,
    modifyKelas,
    getAllKelas,
    getKelasById,
    removeKelas,
    getKelasTahunAjaran,
} from '../controllers/kelasController.js';

const router = express.Router();

router.post('/create/:tahunAjaranId', authMiddleware, createKelas);

router.put('/update/:id', authMiddleware, modifyKelas);

router.get('/', authMiddleware, getAllKelas);
router.get('/tahun-ajaran', authMiddleware, getKelasTahunAjaran);

router.get('/:id', authMiddleware, getKelasById);

router.delete('/delete/:id', authMiddleware, removeKelas);

export default router;
