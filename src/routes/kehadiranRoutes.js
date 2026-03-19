import express from "express";
import {
  createKehadiran,
  modifyKehadiran,
  seeAllKehadiran,
  getKehadiranByFilter,
  getKehadiranById,
} from "../controllers/kehadiranController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRoleMiddleware.js";

const router = express.Router();
router.post(
  "/create",
  authMiddleware,
  authorizeRole("Admin", "WakilKepalaSekolah"),
  createKehadiran,
);
router.put(
  "/update/:id",
  authMiddleware,
  authorizeRole("Admin", "WakilKepalaSekolah"),
  modifyKehadiran,
);
router.get("/", authMiddleware, seeAllKehadiran);
router.get("/rekap", authMiddleware, getKehadiranByFilter);
router.get("/:id", authMiddleware, getKehadiranById);

export default router;
