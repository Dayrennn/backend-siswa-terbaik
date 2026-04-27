import express from 'express';
import {
    createSiswa,
    getSiswaById,
    modifySiswa,
    seeAllSiswa,
    removeSiswa,
    seeAllSiswaByTahunAjaran,
    seeAllSiswaByTahunAjaranAndKelas,
    seeAllSiswaByKehadiran,
} from '../controllers/siswaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

const router = express.Router();

router.post(
    '/create/:tahunAjaranId',
    authMiddleware,
    authorizeRole('Admin', 'Guru', 'WaliKelas'),
    createSiswa,
);
router.put('/update/:id', authMiddleware, authorizeRole('Admin', 'Guru', 'WaliKelas'), modifySiswa);

router.get('/tahun-ajaran/:tahunAjaranId', seeAllSiswaByTahunAjaran);
router.get('/tahun-ajaran/:tahunAjaranId/:kelasId', seeAllSiswaByTahunAjaranAndKelas);

router.get(
    '/kehadiran',
    authMiddleware,
    authorizeRole("Admin", "Guru", "WaliKelas"),
    seeAllSiswaByKehadiran,
);

router.get('/', seeAllSiswa);
router.get('/:id', getSiswaById);

router.delete('/delete/:id', authMiddleware, authorizeRole('Admin'), removeSiswa);

export default router;
