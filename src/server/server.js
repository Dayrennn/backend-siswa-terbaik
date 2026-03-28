import express from "express";
import userRoutes from "../routes/userRoutes.js";
import otpRoutes from "../routes/otpRoutes.js";
import siswaRoutes from "../routes/siswaRoutes.js";
import kriteriaRoutes from "../routes/kriteriaRoutes.js";
import pelajaranRoutes from "../routes/pelajaranRoutes.js";
import kehadiranRoutes from "../routes/kehadiranRoutes.js";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

app.use(morgan("dev"));

app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// route app
app.use("/auth", userRoutes);
app.use("/otp", otpRoutes);
app.use("/siswa", siswaRoutes);
app.use("/kriteria", kriteriaRoutes);
app.use("/pelajaran", pelajaranRoutes);
app.use("/kehadiran", kehadiranRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
