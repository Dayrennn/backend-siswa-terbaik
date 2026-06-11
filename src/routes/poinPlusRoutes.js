import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

import { createPoinPlus, deletePoinPlus, editPoinPlus } from '../controllers/poinPlusController.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin'), createPoinPlus);
router.put('/update/:id', authMiddleware, authorizeRole('Admin'), editPoinPlus);
router.delete('/delete/:id', authMiddleware, authorizeRole('Admin'), deletePoinPlus)

export default router;
