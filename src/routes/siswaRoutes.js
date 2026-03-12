import express from "express";
import { createSiswa, modifySiswa } from "../controllers/siswaController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRoleMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRole("Admin", "Guru", "WaliKelas"),
  createSiswa,
);
router.put(
  "/update",
  authMiddleware,
  authorizeRole("Admin", "Guru", "WaliKelas"),
  modifySiswa,
);

export default router;
