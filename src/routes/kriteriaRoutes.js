import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRoleMiddleware.js";
import {
  createKriteria,
  getKriteriaById,
  modifyKriteria,
  getAllKriteria,
} from "../controllers/kriteriaController.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRole("Admin", "WakilKepalaSekolah"),
  createKriteria,
);

router.put(
  "/update/:id",
  authMiddleware,
  authorizeRole("Admin", "WakilKepalaSekolah"),
  modifyKriteria,
);

router.get(
  "/",
  authMiddleware,
  authorizeRole("Admin", "WakilKepalaSekolah"),
  getAllKriteria,
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRole("Admin", "WakilKepalaSekolah"),
  getKriteriaById,
);

export default router;
