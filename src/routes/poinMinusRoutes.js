import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';

import { createPoinMinus, deletePoinMinus, editPoinMinus } from '../controllers/poinMinusController.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin'), createPoinMinus);
router.put('/update/:id', authMiddleware, authorizeRole('Admin'), editPoinMinus);
router.delete('/delete/:id', authMiddleware, authorizeRole('Admin'), deletePoinMinus);

export default router;
