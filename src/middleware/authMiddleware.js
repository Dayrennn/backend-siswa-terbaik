import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  // cek token
  if (!token) {
    return res.status(401).json({
      message: "Token tidak di temukan",
    });
  }
  try {
    const decoded = verifyToken(token);

    // simpan user dari token ke request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid atau expired",
    });
  }
};
