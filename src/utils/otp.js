import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendOtpEmail = async ({ email, code, type }) => {
  const isRegister = type === "register";

  await transporter.sendMail({
    from: `"Siswa Terbaik" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: isRegister ? "OTP Verifikasi Akun" : "OTP Reset Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h3>${isRegister ? "Verifikasi Akun" : "Reset Password"}</h3>
        <p>Gunakan kode OTP berikut:</p>
        <h1 style="letter-spacing: 8px; color: #4F46E5;">${code}</h1>
        <p>Kode berlaku selama <strong>5 menit</strong>.</p>
        <p>Jika kamu tidak merasa melakukan ini, abaikan email ini.</p>
      </div>
    `,
  });
};
