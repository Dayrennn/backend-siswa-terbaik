import express from 'express';
import {
    createSiswa,
    getSiswaById,
    modifySiswa,
    seeAllSiswa,
    removeSiswa,
    seeAllSiswaByTahunAjaran,
    seeAllSiswaByTahunAjaranAndKelas,
    seeAllSiswaByEskul,
    seeAllSiswaHafalan,
    seeRankingAngkatan,
    seeRankingKelas,
} from '../controllers/siswaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { authorizeWaliKelasScope } from '../middleware/academicScopeMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin', 'Guru', 'WaliKelas', 'WakilKepalaSekolah'), authorizeWaliKelasScope, createSiswa);
router.put('/update/:id', authMiddleware, authorizeRole('Admin', 'Guru', 'WaliKelas', 'WakilKepalaSekolah'), authorizeWaliKelasScope, modifySiswa);

router.get('/tahun-ajaran/:tahunAjaranId', authMiddleware, seeAllSiswaByTahunAjaran);
router.get('/tahun-ajaran/:tahunAjaranId/:kelasId', authMiddleware, seeAllSiswaByTahunAjaranAndKelas);
router.get('/ranking/angkatan', seeRankingAngkatan);
router.get('/ranking/kelas', seeRankingKelas);

router.get('/siswa-eskul/:eskulId', authMiddleware, authorizeRole('Admin', 'Guru', 'WaliKelas'), seeAllSiswaByEskul);
router.get('/hafalan', authMiddleware, seeAllSiswaHafalan);

router.get('/', authMiddleware, seeAllSiswa);
router.get('/:id', authMiddleware, getSiswaById);

router.delete('/delete/:id', authMiddleware, authorizeRole('Admin', 'WaliKelas', 'WakilKepalaSekolah'), authorizeWaliKelasScope, removeSiswa);

export default router;
