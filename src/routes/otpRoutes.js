import express from "express";
import { sendRegisterOtp } from "../controllers/otpController.js";

const router = express.Router();

router.post("/register", sendRegisterOtp);

export default router;
