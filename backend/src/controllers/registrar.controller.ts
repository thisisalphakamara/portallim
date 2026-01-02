import { Request, Response } from 'express';
import { prisma } from '../index';
import { supabase } from '../utils/supabase';
import { Role, NotificationType } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { emailService } from '../services/email.service';
import { notificationService } from '../services/notification.service';

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

    console.log('=== STUDENT ACCOUNT CREATION DEBUG ===');
    console.log('Request body:', { email, fullName, studentId, facultyId, programId, nationalId, passportNumber, currentYear });

    // Check if user already exists in local database
    console.log('Checking local database for email:', email);
    const existingUser = await prisma.user.findFirst({
        where: { email }
    });

    console.log('Local database result:', existingUser ? 'USER FOUND' : 'USER NOT FOUND');

    // Check if user already exists in Supabase Auth
    console.log('Checking Supabase Auth for email:', email);
    const { data: existingSupabaseUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.log('ERROR: Could not fetch Supabase users:', listError);
        throw new AppError('Failed to check Supabase Auth', 500);
    }

    const emailExistsInSupabase = existingSupabaseUsers.users.some(user => user.email === email);
    console.log('Supabase Auth result:', emailExistsInSupabase ? 'EMAIL FOUND' : 'EMAIL NOT FOUND');

    // Only block creation if user exists in BOTH systems (complete user)
    // If user exists in only one system, it's a partial/incomplete registration that should be cleaned up
    if (existingUser && emailExistsInSupabase) {
        console.log('ERROR: Complete user exists in both systems');
        throw new AppError('A user with this email address has already been registered', 400);
    }

    // If user exists partially, clean up the partial registration first
    if (existingUser && !emailExistsInSupabase) {
        console.log('Cleaning up partial registration: User exists in local DB but not in Supabase');
        await prisma.user.delete({ where: { id: existingUser.id } });
    }

    if (!existingUser && emailExistsInSupabase) {
        console.log('Cleaning up partial registration: User exists in Supabase but not in local DB');
        const supabaseUser = existingSupabaseUsers.users.find(user => user.email === email);
        if (supabaseUser) {
            await supabase.auth.admin.deleteUser(supabaseUser.id);
        }
    }

    console.log('All checks passed, proceeding with student creation...');

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

    // 3. Create Welcome Notification
    await notificationService.createNotification(
        newUser.id,
        'Welcome to Limkokwing Portal',
        `Welcome ${fullName}! Your student account has been created successfully. Please complete your registration submission.`,
        NotificationType.INFO
    );

    // 4. Send email with login credentials to student
    try {
        await emailService.sendStudentAccountCredentials(
            email,
            fullName,
            studentId,
            password,
            newUser.faculty?.name || 'Unknown Faculty',
            newUser.program?.name || 'Unknown Program'
        );
        console.log(`Student account credentials sent to: ${email}`);
    } catch (emailError) {
        console.error('Failed to send student credentials email:', emailError);
        // Continue with response even if email fails
    }

    res.status(201).json({
        success: true,
        user: newUser,
        temporaryPassword: password,
        message: 'Student account created successfully. Login credentials have been sent to the student\'s email.'
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

export const deleteStudentAccount = asyncHandler(async (req: any, res: Response) => {
    const { email } = req.params;

    if (req.user.role !== Role.REGISTRAR && req.user.role !== Role.SYSTEM_ADMIN) {
        throw new AppError('Only Registrar or System Admin can delete student accounts', 403);
    }

    console.log('=== STUDENT ACCOUNT DELETION DEBUG ===');
    console.log('Deleting student with email:', email);

    // Check if user exists in local database
    console.log('Checking local database for email:', email);
    const existingUser = await prisma.user.findFirst({
        where: { email }
    });

    console.log('Local database result:', existingUser ? 'USER FOUND' : 'USER NOT FOUND');

    // Check if user exists in Supabase Auth
    console.log('Checking Supabase Auth for email:', email);
    const { data: existingSupabaseUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.log('ERROR: Could not fetch Supabase users:', listError);
        throw new AppError('Failed to check Supabase Auth', 500);
    }

    const emailExistsInSupabase = existingSupabaseUsers.users.some(user => user.email === email);
    console.log('Supabase Auth result:', emailExistsInSupabase ? 'EMAIL FOUND' : 'EMAIL NOT FOUND');

    if (!existingUser && !emailExistsInSupabase) {
        throw new AppError('User not found', 404);
    }

    // Delete from local database if exists
    if (existingUser) {
        console.log('Deleting user from local database...');
        await prisma.user.delete({ where: { id: existingUser.id } });
        console.log('User deleted from local database');
    }

    // Delete from Supabase Auth if exists
    if (emailExistsInSupabase) {
        console.log('Deleting user from Supabase Auth...');
        const supabaseUser = existingSupabaseUsers.users.find(user => user.email === email);
        if (supabaseUser) {
            await supabase.auth.admin.deleteUser(supabaseUser.id);
            console.log('User deleted from Supabase Auth');
        }
    }

    console.log('Student account deletion completed successfully');

    res.json({
        success: true,
        message: 'Student account deleted successfully from all systems'
    });
});
