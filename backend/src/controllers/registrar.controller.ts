import { Request, Response } from 'express';
import { prisma } from '../index';
import { supabase } from '../utils/supabase';
import { Role } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/error.middleware';

export const createStudentAccount = asyncHandler(async (req: any, res: Response) => {
    const {
        email,
        fullName,
        studentId,
        facultyId,
        programId,
        password,
        nationalId,
        passportNumber,
        currentYear
    } = req.body;

    if (req.user.role !== Role.REGISTRAR && req.user.role !== Role.SYSTEM_ADMIN) {
        throw new AppError('Only Registrar can create student accounts', 403);
    }

    // 1. Create in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { fullName, role: Role.STUDENT }
    });

    if (authError) {
        throw new AppError(authError.message, 400);
    }

    // 2. Create in Prisma
    const newUser = await prisma.user.create({
        data: {
            email,
            fullName,
            role: Role.STUDENT,
            supabaseId: authData.user.id,
            studentId,
            facultyId,
            programId,
            nationalId,
            passportNumber,
            currentYear: parseInt(currentYear) || 1,
            isFirstLogin: true
        },
        include: { faculty: true, program: true }
    });

    res.status(201).json({
        success: true,
        user: newUser,
        temporaryPassword: password,
        message: 'Student account created successfully.'
    });
});

export const getStudents = asyncHandler(async (req: any, res: Response) => {
    const students = await prisma.user.findMany({
        where: { role: Role.STUDENT },
        include: { faculty: true, program: true }
    });

    const flattenedStudents = students.map(s => ({
        ...s,
        name: s.fullName,
        faculty: s.faculty?.name,
        program: s.program?.name
    }));

    res.json({ success: true, students: flattenedStudents });
});
