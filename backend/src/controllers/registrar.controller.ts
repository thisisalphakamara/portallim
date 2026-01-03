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

    console.log('=== STUDENT ACCOUNT CREATION (OPTIMIZED) ===');

    // 1. Quick check in local database
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { studentId }] }
    });

    if (existingUser) {
        if (existingUser.email === email) throw new AppError('A student with this email already exists', 400);
        if (existingUser.studentId === studentId) throw new AppError('A student with this ID already exists', 400);
    }

    // 2. Try to create in Supabase Auth directly (more efficient than listing users)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { fullName, role: Role.STUDENT }
    });

    if (authError) {
        // Handle case where user exists in Supabase but not in our DB
        if (authError.message.includes('already registered') || authError.status === 422) {
            console.log('User exists in Supabase but not Prisma. This is a partial record.');
            // We could try to find the existing Supabase user ID and link it, 
            // but for simplicity and security, we'll ask the admin to contact support or use a different email
            throw new AppError('This email is already registered in the authentication system. Please use a different email or contact technical support.', 400);
        }
        throw new AppError(authError.message, 400);
    }

    try {
        // 3. Create in Prisma
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

        // 4. Create internal notification (fast)
        await notificationService.createNotification(
            newUser.id,
            'Welcome to Limkokwing Portal',
            `Welcome ${fullName}! Your student account has been created successfully.`,
            NotificationType.INFO
        );

        // 5. Audit Log (fast)
        await prisma.auditLog.create({
            data: {
                action: 'ACCOUNT_CREATED',
                performedBy: req.user.id,
                targetUser: newUser.id,
                details: `Created STUDENT account for ${fullName}`,
                ipAddress: req.ip || 'Unknown'
            }
        });

        // 6. Send Credentials Email (BACKGROUND - NO AWAIT)
        emailService.sendStudentAccountCredentials(
            email,
            fullName,
            studentId,
            password,
            newUser.faculty?.name || 'Unknown Faculty',
            newUser.program?.name || 'Unknown Program'
        ).catch(err => console.error('Failed to send credentials email in background:', err));

        res.status(201).json({
            success: true,
            user: newUser,
            message: 'Student account created successfully.'
        });

    } catch (prismaError) {
        // Rollback Supabase user if Prisma fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw prismaError;
    }
});

export const getStudents = asyncHandler(async (req: any, res: Response) => {
    const students = await prisma.user.findMany({
        where: { role: Role.STUDENT },
        include: {
            faculty: true,
            program: true,
            submissions: {
                orderBy: { submittedAt: 'desc' },
                take: 1
            }
        }
    });

    const flattenedStudents = students.map(s => {
        const latestSubmission = s.submissions[0];
        let registrationStatus = 'NOT_STARTED';

        if (latestSubmission) {
            registrationStatus = latestSubmission.status;
        }

        return {
            ...s,
            name: s.fullName,
            faculty: s.faculty?.name,
            program: s.program?.name,
            registrationStatus
        };
    });

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
        console.log('Deleting user and related data from local database...');

        // 1. Delete notifications
        await prisma.notification.deleteMany({
            where: { userId: existingUser.id }
        });

        // 2. Handle submissions and related data
        const userSubmissions = await prisma.submission.findMany({
            where: { studentId: existingUser.id }
        });

        for (const sub of userSubmissions) {
            // Delete approval logs for this submission
            await prisma.approvalLog.deleteMany({
                where: { submissionId: sub.id }
            });

            // Delete registration documents for this submission
            await prisma.registrationDocument.deleteMany({
                where: { submissionId: sub.id }
            });
        }

        // Delete the submissions themselves
        await prisma.submission.deleteMany({
            where: { studentId: existingUser.id }
        });

        // 3. Clear audit log references (AuditLog usually shouldn't be deleted for compliance, but we can nullify the target)
        await prisma.auditLog.updateMany({
            where: { targetUser: existingUser.id },
            data: { targetUser: null }
        });

        // 4. Delete the user
        await prisma.user.delete({ where: { id: existingUser.id } });

        console.log('User and all related data deleted from local database');
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
