import { Request, Response } from 'express';
import { prisma } from '../index';
import { supabase } from '../utils/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppError, asyncHandler } from '../middleware/error.middleware';

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // 1. Check if user exists in our DB
    const user = await prisma.user.findFirst({
        where: { email },
        include: { faculty: true, program: true }
    });

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    const now = new Date();
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_DURATION_MINUTES = 15;

    if (user.lockedUntil && user.lockedUntil > now) {
        throw new AppError(`Account locked until ${user.lockedUntil.toLocaleString()}. Please try again later.`, 403);
    }

    // 2. Auth with Supabase
    let session;
    if (!user.supabaseId) {
        throw new AppError('User account is not active. Please contact support.', 401);
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

        const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
        let errorMessage = error.message;

        if (remainingAttempts > 0) {
            errorMessage += ` ${remainingAttempts} attempts remaining.`;
        }

        if (shouldLock) {
            errorMessage += ` Account locked for ${LOCK_DURATION_MINUTES} minutes.`;
        }

        throw new AppError(errorMessage, 401);
    }

    session = data.session;

    // 3. Generate our own JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new AppError('Server configuration error', 500);
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '24h' }
    );

    // Reset login attempts on successful login
    await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedUntil: null }
    });

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
            faculty: user.faculty?.name || null,
            facultyId: user.facultyId,
            program: user.program?.name || null,
            studentId: user.studentId,
            phoneNumber: user.phoneNumber,
            sponsorType: user.sponsorType
        }
    });
});

export const changePassword = asyncHandler(async (req: any, res: Response) => {
    const { newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Update in Supabase if exists
    if (user.supabaseId) {
        const { error } = await supabase.auth.admin.updateUserById(user.supabaseId, {
            password: newPassword
        });
        if (error) {
            throw new AppError(`Failed to update password: ${error.message}`, 500);
        }
    }

    // Update first login flag
    await prisma.user.update({
        where: { id: userId },
        data: { isFirstLogin: false }
    });

    res.json({ success: true, message: 'Password updated successfully.' });
});

export const changeEmail = asyncHandler(async (req: any, res: Response) => {
    const { newEmail, password } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!newEmail || !password) {
        throw new AppError('New email and password are required', 400);
    }

    // Get current user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Check if new email is same as current
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
        throw new AppError('New email must be different from current email', 400);
    }

    // Verify password by attempting to sign in with Supabase
    if (user.supabaseId) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password
        });

        if (signInError) {
            throw new AppError('Invalid password', 401);
        }
    }

    // Check if new email already exists
    const existingUser = await prisma.user.findFirst({
        where: { email: newEmail.toLowerCase() }
    });

    if (existingUser) {
        throw new AppError('Email address already in use', 400);
    }

    // Update email in Supabase
    if (user.supabaseId) {
        const { error } = await supabase.auth.admin.updateUserById(user.supabaseId, {
            email: newEmail.toLowerCase()
        });

        if (error) {
            throw new AppError(`Failed to update email in authentication system: ${error.message}`, 500);
        }
    }

    // Update email in database
    await prisma.user.update({
        where: { id: userId },
        data: { email: newEmail.toLowerCase() }
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            action: 'EMAIL_CHANGED',
            performedBy: userId,
            targetUser: userId,
            details: `Email changed from ${user.email} to ${newEmail.toLowerCase()}`,
            ipAddress: req.ip || 'Unknown'
        }
    });

    res.json({
        success: true,
        message: 'Email updated successfully. Please use your new email for future logins.',
        newEmail: newEmail.toLowerCase()
    });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
    const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { faculty: true, program: true }
    });

    if (!dbUser) {
        throw new AppError('User not found', 404);
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
            faculty: dbUser.faculty?.name || null,
            facultyId: dbUser.facultyId,
            program: dbUser.program?.name || null,
            studentId: dbUser.studentId,
            phoneNumber: dbUser.phoneNumber,
            sponsorType: dbUser.sponsorType
        }
    });
});
