import { createPertemuan } from "../controllers/pertemuanController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRoleMiddleware.js";
import express from "express";

const router = express.Router();

router.post(
  "/create/:kelasId",
  authMiddleware,
  authorizeRole("Admin", "Guru", "WaliKelas"),
  createPertemuan,
);

export default router;
