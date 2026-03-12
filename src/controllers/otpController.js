import { sendOtp } from "../services/otpService.js";

// kirim otp
export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    await sendOtp({ email, type: "register" });
    res.status(200).json({ message: "OTP Berhasil Dikirim" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
