import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { simpanHafalan } from '../controllers/hafalanController.js';

const router = express.Router();

router.post('/simpan', authMiddleware, simpanHafalan);

export default router;
