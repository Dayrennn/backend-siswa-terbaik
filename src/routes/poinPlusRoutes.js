import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

import { createPoinPlus, deletePoinPlus, editPoinPlus } from '../controllers/poinPlusController.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah', 'WaliKelas'), createPoinPlus);
router.put('/update/:id', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah', 'WaliKelas'), editPoinPlus);
router.delete('/delete/:id', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah', 'WaliKelas'), deletePoinPlus);

export default router;
