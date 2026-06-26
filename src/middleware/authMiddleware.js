import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
    // Baca dari header Authorization, fallback ke cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'Token tidak di temukan' });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau expired' });
    }
};