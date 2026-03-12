import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // cek token
  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak di temukan",
    });
  }

  // validasi format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }
  // format
  const token = authHeader.split(" ")[1];

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
