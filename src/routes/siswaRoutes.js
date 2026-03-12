import express from "express";
import {
  createSiswa,
  getSiswaById,
  modifySiswa,
  seeAllSiswa,
} from "../controllers/siswaController.js";
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

router.get("/", seeAllSiswa);
router.get("/:id", getSiswaById);

export default router;
