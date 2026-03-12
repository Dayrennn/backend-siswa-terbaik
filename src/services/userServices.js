import { generateToken } from "../utils/jwt.js";
import prisma from "../config/prisma.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { sendOtp, verifyOtp } from "./otpService.js";

const validatePhone = (telephone) => {
  if (!telephone) throw new Error("Nomor Telephone Wajib Diisi");
  if (!/^0\d{9,12}$/.test(telephone)) {
    throw new Error(
      "Nomor telepon harus diawali 0 dan terdiri dari 10-13 digit",
    );
  }
};

// request otp
export const requestRegisterOtp = async ({
  username,
  email,
  password,
  telephone,
}) => {
  // validasi telephone
  validatePhone(telephone);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) throw new Error("Username atau email sudah terdaftar");

  const hashedPassword = await hashPassword(password);
  await sendOtp({
    email,
    type: "register",
    metadata: { username, password: hashedPassword, telephone },
  });
};

// verify otp & daftar
export const verifyRegisterWithOtp = async ({ email, otp }) => {
  // simpan sementara di metadata
  const metadata = await verifyOtp({ email, code: otp, type: "register" });

  const newUser = await prisma.user.create({
    data: {
      username: metadata.username,
      email,
      password: metadata.password,
      telephone: metadata.telephone,
    },
  });

  return newUser;
};

// login
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      role: true,
      telephone: true,
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error("Password salah");
  }

  // generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
    },
    token,
  };
};

// update
export const updateUser = async (
  id,
  { username, email, telephone, password, role },
) => {
  // cek user
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser) throw new Error("User tidak ditemukan");

  // cek telephone kalo di isi
  if (telephone) validatePhone(telephone);

  // cek email dan username
  if (username || email) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          username ? { username } : undefined,
          email ? { email } : undefined,
        ].filter(Boolean),
        NOT: { id },
      },
    });
    if (existing) throw new Error("Username atau email sudah di gunakan");
  }

  // validasi role
  const validRoles = [
    "Guru",
    "WaliKelas",
    "KepalaSekolah",
    "WakilKepalaSekolah",
    "Admin",
  ];

  // berarti role nya ga ada
  if (role && !validRoles.includes(role)) throw new Error("Role tidak valid");

  // update data hanya field yang dikirim
  const data = {};
  if (username) data.username = username;
  if (email) data.email = email;
  if (password) data.password = await hashPassword(password);
  if (telephone) data.telephone = telephone;
  if (role) data.role = role;

  const updateUser = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      telephone: true,
      role: true,
    },
  });

  return updateUser;
};

// get all user
export const getAllUser = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      telephone: true,
      role: true,
      isVerified: true,
    },
  });

  return users;
};

// get one user
export const getOneUser = async (id) => {
  const users = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      telephone: true,
      role: true,
      isVerified: true,
    },
  });

  return users;
};
