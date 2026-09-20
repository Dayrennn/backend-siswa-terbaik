jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: {
        user: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        pelajaran: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('../../utils/bcrypt.js', () => ({
    __esModule: true,
    comparePassword: jest.fn(),
    hashPassword: jest.fn(),
}));

jest.mock('../../utils/jwt.js', () => ({
    __esModule: true,
    generateToken: jest.fn(),
}));

jest.mock('../../services/otpService.js', () => ({
    __esModule: true,
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
}));

import prisma from '../../config/prisma.js';
import { comparePassword, hashPassword } from '../../utils/bcrypt.js';
import { generateToken } from '../../utils/jwt.js';
import { sendOtp, verifyOtp } from '../../services/otpService.js';
import {
    loginUser,
    requestRegisterOtp,
    verifyRegisterWithOtp,
    updateUser,
    deleteUser,
} from '../../services/userServices.js';

describe('userService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        hashPassword.mockResolvedValue('hashed');
    });


    it('TC-01 (P1: 1-2-3-9): email tidak ditemukan', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(loginUser({ email: 'x@mail.com', password: '123456' })).rejects.toThrow('User tidak ditemukan');
        expect(comparePassword).not.toHaveBeenCalled();
    });

    it('TC-02 (P2: 1-2-4-5-6-9): password salah', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@mail.com', password: 'hash', role: 'USER' });
        comparePassword.mockResolvedValue(false);

        await expect(loginUser({ email: 'a@mail.com', password: 'salah' })).rejects.toThrow(
            'Email atau Password salah',
        );
        expect(generateToken).not.toHaveBeenCalled();
    });

    it('TC-03 (P3: 1-2-4-5-7-8-9): login berhasil', async () => {
        const fakeUser = { id: 1, email: 'a@mail.com', password: 'hash', role: 'USER' };
        prisma.user.findUnique.mockResolvedValue(fakeUser);
        comparePassword.mockResolvedValue(true);
        generateToken.mockReturnValue('token123');

        const result = await loginUser({ email: 'a@mail.com', password: 'benar' });

        expect(result).toEqual({ user: fakeUser, token: 'token123' });
        expect(generateToken).toHaveBeenCalledWith({ id: 1, email: 'a@mail.com', role: 'USER' });
    });

    // ===================== CREATE 1: REQUEST OTP DAFTAR =====================

    describe('requestRegisterOtp', () => {
        const registerInput = {
            username: 'udin',
            email: 'udin@mail.com',
            password: 'rahasia123',
            telephone: '081234567890',
            pelajaranId: [1, 2],
        };

        it('Request OTP daftar (Telepon kosong)', async () => {
            await expect(requestRegisterOtp({ ...registerInput, telephone: undefined })).rejects.toThrow(
                'Nomor Telephone Wajib Diisi',
            );

            expect(prisma.user.findFirst).not.toHaveBeenCalled();
            expect(sendOtp).not.toHaveBeenCalled();
        });

        it.each([
            ['tidak diawali 0', '628123456789'],
            ['kurang dari 10 digit', '081234567'],
            ['lebih dari 13 digit', '08123456789012'],
            ['mengandung huruf', '0812345abc90'],
        ])('Request OTP daftar (Format telepon salah: %s)', async (_label, telephone) => {
            await expect(requestRegisterOtp({ ...registerInput, telephone })).rejects.toThrow(
                'Nomor telepon harus diawali 0 dan terdiri dari 10-13 digit',
            );

            expect(prisma.user.findFirst).not.toHaveBeenCalled();
            expect(sendOtp).not.toHaveBeenCalled();
        });

        it('Request OTP daftar (Username atau email sudah terdaftar)', async () => {
            prisma.user.findFirst.mockResolvedValueOnce({ id: 9, username: 'udin' });

            await expect(requestRegisterOtp(registerInput)).rejects.toThrow('Username atau email sudah terdaftar');

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { OR: [{ username: 'udin' }, { email: 'udin@mail.com' }] },
            });
            expect(hashPassword).not.toHaveBeenCalled();
            expect(sendOtp).not.toHaveBeenCalled();
        });

        it('Request OTP daftar (Telepon sudah terdaftar)', async () => {
            prisma.user.findFirst
                .mockResolvedValueOnce(null) // username/email aman
                .mockResolvedValueOnce({ id: 9, telephone: '081234567890' }); // telepon dipakai

            await expect(requestRegisterOtp(registerInput)).rejects.toThrow('Telephone sudah terdaftar');

            expect(sendOtp).not.toHaveBeenCalled();
        });

        it('Request OTP daftar (Data pelajaran tidak ditemukan)', async () => {
            prisma.user.findFirst.mockResolvedValue(null);
            prisma.pelajaran.findMany.mockResolvedValue([{ id: 1 }]);

            await expect(requestRegisterOtp(registerInput)).rejects.toThrow('Data pelajaran tidak ditemukan');

            expect(sendOtp).not.toHaveBeenCalled();
        });

        it('Request OTP daftar (Berhasil, dengan pelajaran)', async () => {
            prisma.user.findFirst.mockResolvedValue(null);
            prisma.pelajaran.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

            await requestRegisterOtp(registerInput);

            expect(prisma.pelajaran.findMany).toHaveBeenCalledWith({ where: { id: { in: [1, 2] } } });
            expect(hashPassword).toHaveBeenCalledWith('rahasia123');
            // password yang disimpan di metadata OTP harus sudah di-hash
            expect(sendOtp).toHaveBeenCalledWith({
                email: 'udin@mail.com',
                type: 'register',
                metadata: {
                    username: 'udin',
                    password: 'hashed',
                    telephone: '081234567890',
                    pelajaranId: [1, 2],
                },
            });
        });

        it('Request OTP daftar (Berhasil, tanpa pelajaran)', async () => {
            prisma.user.findFirst.mockResolvedValue(null);

            await requestRegisterOtp({ ...registerInput, pelajaranId: undefined });

            expect(prisma.pelajaran.findMany).not.toHaveBeenCalled();
            expect(sendOtp).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata: expect.objectContaining({ pelajaranId: [] }),
                }),
            );
        });
    });

    // ===================== CREATE 2: VERIFIKASI OTP & DAFTAR =====================

    describe('verifyRegisterWithOtp', () => {
        it('Verifikasi OTP daftar (OTP salah)', async () => {
            verifyOtp.mockRejectedValue(new Error('Kode OTP salah'));

            await expect(verifyRegisterWithOtp({ email: 'udin@mail.com', otp: '000000' })).rejects.toThrow(
                'Kode OTP salah',
            );

            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it('Verifikasi OTP daftar (Berhasil, dengan pelajaran)', async () => {
            const created = { id: 1, username: 'udin', email: 'udin@mail.com' };

            verifyOtp.mockResolvedValue({
                username: 'udin',
                password: 'hashed',
                telephone: '081234567890',
                pelajaranId: [1, 2],
            });
            prisma.user.create.mockResolvedValue(created);

            const result = await verifyRegisterWithOtp({ email: 'udin@mail.com', otp: '123456' });

            expect(verifyOtp).toHaveBeenCalledWith({ email: 'udin@mail.com', code: '123456', type: 'register' });
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    username: 'udin',
                    email: 'udin@mail.com',
                    password: 'hashed',
                    telephone: '081234567890',
                    pelajaran: {
                        create: [{ pelajaranId: 1 }, { pelajaranId: 2 }],
                    },
                },
                include: {
                    pelajaran: { include: { pelajaran: true } },
                },
            });
            expect(result).toEqual(created);
        });

        it('Verifikasi OTP daftar (Berhasil, tanpa pelajaran)', async () => {
            verifyOtp.mockResolvedValue({
                username: 'udin',
                password: 'hashed',
                telephone: '081234567890',
                pelajaranId: [],
            });
            prisma.user.create.mockResolvedValue({ id: 1 });

            await verifyRegisterWithOtp({ email: 'udin@mail.com', otp: '123456' });

            // relasi pelajaran tidak boleh dikirim kalau kosong
            const { data } = prisma.user.create.mock.calls[0][0];
            expect(data).not.toHaveProperty('pelajaran');
        });
    });


    describe('updateUser', () => {
        const existingUser = { id: 1, username: 'udin', email: 'udin@mail.com', role: 'Guru' };

        it('Mengedit user (Tidak ditemukan)', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(updateUser(99, { username: 'baru' })).rejects.toThrow('User tidak ditemukan');

            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('Mengedit user (Format telepon salah)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser);

            await expect(updateUser(1, { telephone: '12345' })).rejects.toThrow(
                'Nomor telepon harus diawali 0 dan terdiri dari 10-13 digit',
            );

            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('Mengedit user (Username atau email sudah digunakan)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser);
            prisma.user.findFirst.mockResolvedValue({ id: 2, username: 'asep' });

            await expect(updateUser(1, { username: 'asep', email: 'asep@mail.com' })).rejects.toThrow(
                'Username atau email sudah di gunakan',
            );

            // pengecekan duplikat harus mengecualikan user yang sedang diedit
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [{ username: 'asep' }, { email: 'asep@mail.com' }],
                    NOT: { id: 1 },
                },
            });
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('Mengedit user (Role tidak valid)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser);

            await expect(updateUser(1, { role: 'Siswa' })).rejects.toThrow('Role tidak valid');

            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('Mengedit user (Data pelajaran tidak ditemukan)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser);
            prisma.pelajaran.findMany.mockResolvedValue([{ id: 1 }]); // diminta 2, ketemu 1

            await expect(updateUser(1, { pelajaranId: [1, 2] })).rejects.toThrow('Data pelajaran tidak ditemukan');

            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('Mengedit user (Berhasil, semua field)', async () => {
            const updated = { id: 1, username: 'baru', email: 'baru@mail.com', role: 'Guru' };

            prisma.user.findUnique.mockResolvedValue(existingUser);
            prisma.user.findFirst.mockResolvedValue(null); // tidak ada duplikat
            prisma.user.update.mockResolvedValue(updated);

            const result = await updateUser(1, {
                username: 'baru',
                email: 'baru@mail.com',
                password: 'rahasia456',
                telephone: '081234567890',
                role: 'Guru',
            });

            expect(hashPassword).toHaveBeenCalledWith('rahasia456');
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 1 },
                    data: {
                        username: 'baru',
                        email: 'baru@mail.com',
                        password: 'hashed', // yang disimpan hasil hash, bukan teks asli
                        telephone: '081234567890',
                        role: 'Guru',
                        waliKelas: { set: [] },
                    },
                }),
            );

            // password tidak boleh ikut dikembalikan
            const { select } = prisma.user.update.mock.calls[0][0];
            expect(select).not.toHaveProperty('password');

            expect(result).toEqual(updated);
        });

        it('Mengedit user (Berhasil, hanya ubah username)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser);
            prisma.user.findFirst.mockResolvedValue(null);
            prisma.user.update.mockResolvedValue({ id: 1, username: 'baru' });

            await updateUser(1, { username: 'baru' });

            // email tidak dikirim, jadi tidak ikut di pengecekan duplikat
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { OR: [{ username: 'baru' }], NOT: { id: 1 } },
            });
            expect(hashPassword).not.toHaveBeenCalled();
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { username: 'baru', waliKelas: { set: [] } },
                }),
            );
        });

        it('Mengedit user (Berhasil, hanya ubah telepon)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser);
            prisma.user.update.mockResolvedValue({ id: 1 });

            await updateUser(1, { telephone: '081234567890' });

            // username dan email tidak dikirim, jadi tidak perlu cek duplikat
            expect(prisma.user.findFirst).not.toHaveBeenCalled();
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { telephone: '081234567890', waliKelas: { set: [] } },
                }),
            );
        });

        it('Mengedit user (Berhasil, ganti daftar pelajaran)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser);
            prisma.pelajaran.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
            prisma.user.update.mockResolvedValue({ id: 1 });

            await updateUser(1, { pelajaranId: [1, 2] });

            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        pelajaran: {
                            deleteMany: {}, // relasi lama dihapus dulu
                            create: [{ pelajaranId: 1 }, { pelajaranId: 2 }],
                        },
                    }),
                }),
            );
        });

        it('Mengedit user (Berhasil, pelajaran dikosongkan)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser);
            prisma.user.update.mockResolvedValue({ id: 1 });

            await updateUser(1, { pelajaranId: [] });

            // array kosong tidak divalidasi ke database, dan semua relasi dihapus
            expect(prisma.pelajaran.findMany).not.toHaveBeenCalled();
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        pelajaran: { deleteMany: {}, create: [] },
                    }),
                }),
            );
        });

        it('Mengedit user (Berhasil, jadi Wali Kelas dengan kelas)', async () => {
            prisma.user.findUnique.mockResolvedValue(existingUser); // role lama: Guru
            prisma.user.update.mockResolvedValue({ id: 1, role: 'WaliKelas' });

            await updateUser(1, { role: 'WaliKelas', kelasId: 5 });

            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { role: 'WaliKelas', waliKelas: { set: [{ id: 5 }] } },
                }),
            );
        });

        it('Mengedit user (Berhasil, Wali Kelas tanpa kelasId -> kelas tidak diubah)', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...existingUser, role: 'WaliKelas' });
            prisma.user.update.mockResolvedValue({ id: 1 });

            await updateUser(1, { username: 'baru' });

            const { data } = prisma.user.update.mock.calls[0][0];
            expect(data).not.toHaveProperty('waliKelas');
        });

        it('Mengedit user (Berhasil, pindah dari Wali Kelas ke Guru -> kelas dilepas)', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...existingUser, role: 'WaliKelas' });
            prisma.user.update.mockResolvedValue({ id: 1, role: 'Guru' });

            await updateUser(1, { role: 'Guru' });

            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { role: 'Guru', waliKelas: { set: [] } },
                }),
            );
        });
    });


    describe('deleteUser', () => {
        it('Delete user (Berhasil)', async () => {
            const fakeUser = { id: 1, username: 'udin' };

            prisma.user.delete.mockResolvedValue(fakeUser);

            const result = await deleteUser(1);

            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(fakeUser);
        });

        it('Delete user (Tidak ditemukan)', async () => {
            // service tidak mengecek dulu, jadi error datang dari Prisma (P2025)
            prisma.user.delete.mockRejectedValue(new Error('Record to delete does not exist.'));

            await expect(deleteUser(99)).rejects.toThrow('Record to delete does not exist.');
        });
    });
});
