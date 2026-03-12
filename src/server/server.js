import express from "express";
import userRoutes from "../routes/userRoutes.js";
import otpRoutes from "../routes/otpRoutes.js";
import siswaRoutes from "../routes/siswaRoutes.js";
import morgan from "morgan";

const app = express();
const port = 3000;

app.use(morgan("dev"));
app.use(express.json());

// route app
app.use("/auth", userRoutes);
app.use("/otp", otpRoutes);
app.use("/siswa", siswaRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
