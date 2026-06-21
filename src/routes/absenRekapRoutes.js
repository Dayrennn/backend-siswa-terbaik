import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { simpanAbsenRekap } from '../controllers/absenRekapController.js';

const router = express.Router();

router.post('/simpan/:siswaId/:pelajaranId', authMiddleware, simpanAbsenRekap);

export default router;
