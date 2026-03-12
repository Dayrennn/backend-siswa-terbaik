import prisma from "../config/prisma.js";
import { sendOtpEmail } from "../utils/otp.js";

// generate otp
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async ({ email, type, metadata = null }) => {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  // hapus otp lama
  await prisma.otp.deleteMany({ where: { email, type } });

  // buat otp baru
  await prisma.otp.create({
    data: {
      email,
      code,
      type,
      expiresAt,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
  await sendOtpEmail({ email, code, type });
};

// verifikasi otp
export const verifyOtp = async ({ email, code, type }) => {
  const record = await prisma.otp.findFirst({
    where: {
      email,
      code,
      type,
    },
  });

  if (!record) {
    throw new Error("OTP Tidak valid");
  }
  if (record.expiresAt < new Date()) {
    throw new Error("OTP Telah Kadarluasa");
  }

  // hapus setelah sekali pakai
  await prisma.otp.delete({ where: { id: record.id } });

  return record.metadata ? JSON.parse(record.metadata) : null;
};
