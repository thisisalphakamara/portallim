import { Request, Response } from 'express';
import { prisma } from '../index';
import { supabase } from '../utils/supabase';
import { Role } from '@prisma/client';

export const createStudentAccount = async (req: any, res: Response) => {
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
        return res.status(403).json({ error: 'Only Registrar can create student accounts' });
    }

    try {
        // 1. Create in Supabase
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { fullName, role: Role.STUDENT }
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
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
            }
        });

        res.status(201).json({
            success: true,
            user: newUser,
            temporaryPassword: password
        });
    } catch (error: any) {
        console.error('Create student error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getStudents = async (req: any, res: Response) => {
    try {
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
