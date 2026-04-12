import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRoleMiddleware.js";

import {
  createKelas,
  modifyKelas,
  getAllKelas,
  getKelasById,
  removeKelas,
} from "../controllers/kelasController.js";

const router = express.Router();

router.post("/create", authMiddleware, authorizeRole("Admin"), createKelas);

router.put("/update/:id", authMiddleware, authorizeRole("Admin"), modifyKelas);

router.get("/", authMiddleware, authorizeRole("Admin"), getAllKelas);

router.get("/:id", authMiddleware, authorizeRole("Admin"), getKelasById);

router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeRole("Admin"),
  removeKelas,
);

export default router;
