export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, silahkan login" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbiden: Akses Ditolak" });
    }
    next();
  };
};
