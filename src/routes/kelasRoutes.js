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

router.post('/create/:tahunAjaranId/:kelasIndukId', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah'), createKelas);

router.put('/update/:id', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah'), modifyKelas);

router.get('/', authMiddleware, getAllKelas);
router.get('/tahun-ajaran', getKelasTahunAjaran);

router.get('/:id', authMiddleware, getKelasById);

router.delete('/delete/:id', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah'), removeKelas);

export default router;
