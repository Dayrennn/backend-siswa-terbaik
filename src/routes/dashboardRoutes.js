import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { seeAllHomeData } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', authMiddleware, seeAllHomeData);

export default router;
