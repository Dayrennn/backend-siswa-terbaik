import prisma from '../config/prisma.js';
import { comparePassword, hashPassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { sendOtp, verifyOtp } from './otpService.js';

const validatePhone = (telephone) => {
    if (!telephone) throw new Error('Nomor Telephone Wajib Diisi');
    if (!/^0\d{9,12}$/.test(telephone)) {
        throw new Error('Nomor telepon harus diawali 0 dan terdiri dari 10-13 digit');
    }
};

// request otp
export const requestRegisterOtp = async ({ username, email, password, telephone, pelajaranId }) => {
    // validasi telephone
    validatePhone(telephone);

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }],
        },
    });

    if (existingUser) throw new Error('Username atau email sudah terdaftar');

    const existingTelephone = await prisma.user.findFirst({
        where: {
            OR: [{ telephone }],
        },
    });

    if (existingTelephone) throw new Error('Telephone sudah terdaftar');

    // validasi pelajaran
    if (pelajaranId && pelajaranId.length > 0) {
        const found = await prisma.pelajaran.findMany({
            where: { id: { in: pelajaranId } },
        });
        if (found.length !== pelajaranId.length) {
            throw new Error('Data pelajaran tidak ditemukan');
        }
    }

    const hashedPassword = await hashPassword(password);
    await sendOtp({
        email,
        type: 'register',
        metadata: {
            username,
            password: hashedPassword,
            telephone,
            pelajaranId: pelajaranId ?? [],
        },
    });
};

// verify otp & daftar
export const verifyRegisterWithOtp = async ({ email, otp }) => {
    // simpan sementara di metadata
    const metadata = await verifyOtp({ email, code: otp, type: 'register' });

    const newUser = await prisma.user.create({
        data: {
            username: metadata.username,
            email,
            password: metadata.password,
            telephone: metadata.telephone,

            // pelajaran opsional
            ...(metadata.pelajaranId?.length > 0 && {
                pelajaran: {
                    create: metadata.pelajaranId.map((id) => ({ pelajaranId: id })),
                },
            }),
        },
        include: {
            pelajaran: {
                include: { pelajaran: true },
            },
        },
    });

    return newUser;
};

// login
export const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            pelajaran: {
                include: { pelajaran: true },
            },
        },
    });

    if (!user) throw new Error('User tidak ditemukan');

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error('Email atau Password salah');

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
};

// update
export const updateUser = async (id, { username, email, telephone, password, role, pelajaranId, kelasId }) => {
    // cek user
    const existingUser = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!existingUser) throw new Error('User tidak ditemukan');

    // cek telephone kalo di isi
    if (telephone) validatePhone(telephone);

    // cek email dan username
    if (username || email) {
        const existing = await prisma.user.findFirst({
            where: {
                OR: [username ? { username } : undefined, email ? { email } : undefined].filter(Boolean),
                NOT: { id },
            },
        });
        if (existing) throw new Error('Username atau email sudah di gunakan');
    }

    // validasi role
    const validRoles = ['Guru', 'WaliKelas', 'KepalaSekolah', 'WakilKepalaSekolah', 'Admin'];

    // berarti role nya ga ada
    if (role && !validRoles.includes(role)) throw new Error('Role tidak valid');

    // validasi pelajaran
    if (pelajaranId && pelajaranId.length > 0) {
        const found = await prisma.pelajaran.findMany({
            where: { id: { in: pelajaranId } },
        });
        if (found.length !== pelajaranId.length) {
            throw new Error('Data pelajaran tidak ditemukan');
        }
    }

    // update data hanya field yang dikirim
    const data = {};
    if (username) data.username = username;
    if (email) data.email = email;
    if (password) data.password = await hashPassword(password);
    if (telephone) data.telephone = telephone;
    if (role) data.role = role;

    // jika ada pelajaran yang di isi, set disemua relasi
    if (pelajaranId !== undefined) {
        data.pelajaran = {
            deleteMany: {},
            create: pelajaranId.map((id) => ({ pelajaranId: id })),
        };
    }
    const targetRole = role ?? existingUser.role;
    if (targetRole === 'WaliKelas') {
        if (kelasId) data.kelas = { connect: { id: kelasId } };
    } else {
        data.waliKelas = { set: [] };
    }

    const updateUser = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            username: true,
            email: true,
            telephone: true,
            role: true,
            pelajaran: {
                include: { pelajaran: true },
            },
            waliKelas: true,
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
            pelajaran: {
                include: { pelajaran: true },
            },
            isVerified: true,
            waliKelas: true,
        },
    });

    return users;
};

// get one user & get me
export const getOneUser = async (id) => {
    const users = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            telephone: true,
            role: true,
            pelajaran: {
                include: { pelajaran: true },
            },
            isVerified: true,
            waliKelas: true,
        },
    });

    return users;
};

export const deleteUser = async (id) => {
    const users = await prisma.user.delete({
        where: { id },
    });
    return users;
};

export const getWaliKelas = async () => {
    const waliKelas = await prisma.user.findMany({
        where: { role: 'WaliKelas' },
        select: {
            id: true,
            username: true,
            telephone: true,
            waliKelas: true,
            pelajaran: {
                include: { pelajaran: true },
            },
            isVerified: true,
        },
    });

    return waliKelas;
};

export const getWaliKelasByKelas = async (kelasId) => {
    const waliKelas = await prisma.user.findFirst({
        where: { role: 'WaliKelas', kelasId },
        select: {
            id: true,
            username: true,
            telephone: true,
            waliKelas: true,
            pelajaran: {
                include: { pelajaran: true },
            },
            isVerified: true,
        },
    });

    return waliKelas;
};

export const getAllGuru = async () => {
    const guru = await prisma.user.findMany({
        where: { role: 'Guru' },
        select: {
            id: true,
            username: true,
            telephone: true,
            waliKelas: true,
            pelajaran: {
                include: { pelajaran: true },
            },
            isVerified: true,
        },
    });

    return guru;
};
