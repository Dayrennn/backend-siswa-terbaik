import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authorizeRoleMiddleware";
import {
  createKriteria,
  getKriteriaById,
  modifyKriteria,
  getAllKriteria,
} from "../controllers/kriteriaController";
import { getAllKriteria } from "../services/kriteriaService";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRole("Admin", "WakilKepalaSekolah"),
  createKriteria,
);

router.put(
  "/update",
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
