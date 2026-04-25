import {
    createPertemuan,
    modifyPertemuan,
    removePertemuan,
    seeAllPertemuan,
    seeAllPertemuanByTahunAndKelas,
    seeOnePertemuan,
} from '../controllers/pertemuanController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import express from 'express';

const router = express.Router();

router.post(
    '/create/:kelasId',
    authMiddleware,
    authorizeRole('Admin', 'Guru', 'WaliKelas'),
    createPertemuan,
);

router.put(
    '/update/:id',
    authMiddleware,
    authorizeRole('Admin', 'Guru', 'WaliKelas'),
    modifyPertemuan,
);

router.get('/', authMiddleware, authorizeRole('Admin', 'Guru', 'WaliKelas'), seeAllPertemuan);

router.get(
    '/:tahunAjaranId/:kelasId',
    authMiddleware,
    authorizeRole('Admin', 'Guru', 'WaliKelas'),
    seeAllPertemuanByTahunAndKelas,
);

router.get('/:id', authMiddleware, authorizeRole('Admin', 'Guru', 'WaliKelas'), seeOnePertemuan);

router.delete('/:id', authMiddleware, authorizeRole('Admin', 'Guru', 'WaliKelas'), removePertemuan);

export default router;
