import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware.js';
import { seeAllKelasInduk } from '../controllers/kelasIndukController.js';

const router = express.Router();

router.get('/', seeAllKelasInduk);

export default router;
