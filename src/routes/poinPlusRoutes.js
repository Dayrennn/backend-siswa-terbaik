import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

import { createPoinPlus } from '../controllers/poinPlusController.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin'), createPoinPlus);

export default router;
