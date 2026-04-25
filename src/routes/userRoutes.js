import express from 'express';
import {
    login,
    register,
    update,
    verifyRegisterOtp,
    getUsers,
    getUserById,
    logout,
    getMe,
    removeUser,
} from '../controllers/userControllers.js';
import { authorizeRole } from '../middleware/authorizeRoleMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', authMiddleware, authorizeRole('Admin'), verifyRegisterOtp);
router.post('/register', authMiddleware, authorizeRole('Admin'), register);
router.put('/users/:id', authMiddleware, authorizeRole('Admin'), update);

router.get('/users', authMiddleware, authorizeRole('Admin'), getUsers);
router.get('/users/:id', authMiddleware, authorizeRole('Admin'), getUserById);
router.delete('/users/:id', authMiddleware, authorizeRole('Admin'), removeUser);

router.get('/me', authMiddleware, getMe);

export default router;
