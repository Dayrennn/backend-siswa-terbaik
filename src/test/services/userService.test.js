jest.mock('../../config/prisma.js', () => ({
    __esModule: true,
    default: { user: { findUnique: jest.fn() } },
}));
jest.mock('../../utils/bcrypt.js', () => ({
    __esModule: true,
    comparePassword: jest.fn(),
}));
jest.mock('../../utils/jwt.js', () => ({
    __esModule: true,
    generateToken: jest.fn(),
}));

import prisma from '../../config/prisma.js';
import { comparePassword } from '../../utils/bcrypt.js';
import { generateToken } from '../../utils/jwt.js';
import { loginUser } from '../../services/userServices.js';

describe('userService', () => {
    beforeEach(() => jest.clearAllMocks());

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
});
