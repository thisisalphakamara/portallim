import { Request, Response } from 'express';
import { prisma } from '../index';
import { supabase } from '../utils/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists in our DB
        const user = await prisma.user.findUnique({
            where: { email },
            include: { faculty: true, program: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const now = new Date();
        const MAX_LOGIN_ATTEMPTS = 5;
        const LOCK_DURATION_MINUTES = 15;

        if (user.lockedUntil && user.lockedUntil > now) {
            return res.status(403).json({
                error: `Account locked until ${user.lockedUntil.toISOString()}`,
                attemptsRemaining: 0,
                isLocked: true,
                lockedUntil: user.lockedUntil
            });
        }

        // 2. Auth with Supabase
        let session;
        if (!user.supabaseId) {
            return res.status(401).json({ error: 'User account is not active. Please contact support.' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            const attempts = user.loginAttempts + 1;
            const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;
            const lockedUntil = shouldLock
                ? new Date(now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000)
                : null;

            await prisma.user.update({
                where: { id: user.id },
                data: { loginAttempts: attempts, lockedUntil }
            });

            return res.status(401).json({
                error: error.message,
                attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts),
                isLocked: shouldLock,
                lockedUntil
            });
        }

        session = data.session;

        // 3. Generate our own JWT (or use Supabase token)
        // We'll generate our own to easily include roles and other DB info
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.fullName,
                fullName: user.fullName,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
                faculty: user.faculty?.name,
                facultyId: user.facultyId,
                program: user.program?.name,
                studentId: user.studentId,
                phoneNumber: user.phoneNumber,
                sponsorType: user.sponsorType
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const changePassword = async (req: any, res: Response) => {
    const { newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update in Supabase if exists
        if (user.supabaseId) {
            const { error } = await supabase.auth.admin.updateUserById(user.supabaseId, {
                password: newPassword
            });
            if (error) return res.status(500).json({ error: error.message });
        }

        // Update first login flag
        await prisma.user.update({
            where: { id: userId },
            data: { isFirstLogin: false }
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMe = async (req: any, res: Response) => {
    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { faculty: true, program: true }
        });

        if (!dbUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.fullName,
                fullName: dbUser.fullName,
                role: dbUser.role,
                isFirstLogin: dbUser.isFirstLogin,
                faculty: dbUser.faculty?.name,
                facultyId: dbUser.facultyId,
                program: dbUser.program?.name,
                studentId: dbUser.studentId,
                phoneNumber: dbUser.phoneNumber,
            sponsorType: dbUser.sponsorType
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
