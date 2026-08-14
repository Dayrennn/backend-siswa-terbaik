import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { createEskul, modifyEskul, removeEskul, seeAllEskul } from '../controllers/eskulController.js';

const router = express.Router();

router.post('/create', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah'), createEskul);
router.put('/update/:id', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah'), modifyEskul);
router.delete('/delete/:id', authMiddleware, authorizeRole('Admin', 'WakilKepalaSekolah'), removeEskul);
router.get('/', authMiddleware, seeAllEskul);

export default router;
