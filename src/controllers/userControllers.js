import {
  loginUser,
  requestRegisterOtp,
  updateUser,
  verifyRegisterWithOtp,
  getAllUser,
  getOneUser,
  deleteUser,
} from "../services/userServices.js";
import { generateToken } from "../utils/jwt.js";

// register & kirim otp
export const register = async (req, res) => {
  try {
    const { username, email, password, telephone, pelajaranId } = req.body;
    await requestRegisterOtp({
      username,
      email,
      password,
      telephone,
      pelajaranId,
    });
    res.status(200).json({ message: "OTP Berhasil Terkirim" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// verif otp
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const newUser = await verifyRegisterWithOtp({ email, otp });
    res.status(200).json({ message: "Registrasi Berhasil", data: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });

    // generate token di controller HTTP Only
    const token = generateToken({ id: user.id, role: user.role });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 1000, // seminggu
    });

    res.status(200).json({
      message: "Login Berhasil",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // ← harus sama dengan saat set cookie
  });
  res.status(200).json({ message: "Logout Berhasil" });
};

// update
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, telephone, password, role, pelajaranId } =
      req.body;
    const updatedUser = await updateUser(id, {
      username,
      email,
      telephone,
      password,
      role,
      telephone,
      pelajaranId,
    });

    res
      .status(200)
      .json({ message: "Data berhasil dirubah", data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ambil semua data user
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUser();
    res
      .status(200)
      .json({ message: "Berhasil mengambil data users", data: users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ambil satu data user
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getOneUser(id);
    res
      .status(200)
      .json({ message: "Berhasil mengambil data user by id", data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getOneUser(req.user.id);
    res.status(200).json({ message: "berhasil", data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await deleteUser(id);
    res.status(200).json({ message: "Berhasil menghapus data", data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
