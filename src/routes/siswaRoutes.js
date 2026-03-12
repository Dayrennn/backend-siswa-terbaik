import express from "express";
import { addSiswa, updateSiswa } from "../controllers/siswaController";
import { authMiddleware } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authorizeRoleMiddleware";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRole("Admin", "Guru", "WaliKelas"),
  addSiswa,
);
router.put(
  "/update",
  authMiddleware,
  authorizeRole("Admin", "Guru", "WaliKelas"),
  updateSiswa,
);
