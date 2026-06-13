import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { createEskul, modifyEskul, removeEskul, seeAllEskul } from '../controllers/eskulController.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin'), createEskul);
router.put('/update/:id', authMiddleware, authorizeRole('Admin'), modifyEskul);
router.delete('/delete/:id', authMiddleware, authorizeRole('Admin'), removeEskul);
router.get('/', authMiddleware, seeAllEskul);

export default router;
