import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

import { createPoinMinus } from '../controllers/poinMinusController.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin'), createPoinMinus);

export default router;
