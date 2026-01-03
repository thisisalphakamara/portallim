import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApprovalStatus, Role, NotificationType } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { emailService } from '../services/email.service';
import { notificationService } from '../services/notification.service';

export const submitRegistration = asyncHandler(async (req: any, res: Response) => {
    const { semester, academicYear, modules, enrollmentIntake, yearLevel, phoneNumber, nationalId, sponsorType, studentClass } = req.body;
    const student = req.user;

    if (student.role !== Role.STUDENT) {
        throw new AppError('Only students can submit registrations', 403);
    }

    // Check if faculty and program are assigned
    if (!student.facultyId || !student.programId) {
        throw new AppError('Student must have a faculty and program assigned. Please contact the registrar.', 400);
    }

    // Validate modules array
    if (!Array.isArray(modules) || modules.length === 0) {
        throw new AppError('At least one module must be selected', 400);
    }

    if (modules.length > 10) {
        throw new AppError('Cannot select more than 10 modules per semester', 400);
    }

    // Validate each module structure
    for (const module of modules) {
        if (!module.id || !module.name || !module.code) {
            throw new AppError('Each module must have id, name, and code', 400);
        }
    }

    const existingSubmission = await prisma.submission.findFirst({
        where: {
            studentId: student.id,
            semester,
            academicYear
        }
    });

    if (existingSubmission) {
        throw new AppError(`Registration already submitted for ${semester} ${academicYear}. You cannot submit multiple registrations for the same semester.`, 409);
    }

    // Update user's profile details if provided
    await prisma.user.update({
        where: { id: student.id },
        data: {
            phoneNumber: phoneNumber.trim(),
            ...(nationalId && { nationalId }),
            ...(sponsorType && { sponsorType })
        }
    });

    const submission = await prisma.submission.create({
        data: {
            studentId: student.id,
            facultyId: student.facultyId,
            programId: student.programId,
            semester,
            academicYear,
            enrollmentIntake,
            yearLevel,
            class: studentClass,
            modules,
            status: ApprovalStatus.PENDING_YEAR_LEADER
        }
    });

    // Log the submission
    await prisma.approvalLog.create({
        data: {
            submissionId: submission.id,
            userId: student.id,
            action: 'SUBMITTED',
            comments: 'Initial registration submission'
        }
    });

    // Create In-App Notification
    await notificationService.createNotification(
        student.id,
        'Registration Submitted',
        `Your registration for ${semester} ${academicYear} has been successfully submitted and is pending approval.`,
        NotificationType.INFO
    );

    // Send email notification to student (non-blocking)
    emailService.sendRegistrationSubmissionNotification(
        student.email,
        student.fullName,
        student.faculty || 'Unknown Faculty',
        student.program || 'Unknown Program',
        semester,
        academicYear
    ).catch(err => console.error('Background email failed:', err));

    res.status(201).json({
        success: true,
        submission,
        message: 'Registration submitted successfully. Your registration is now pending approval.'
    });
});

export const getRegistrations = async (req: any, res: Response) => {
    const user = req.user;

    try {
        let where: any = {};

        // Faculty-based routing rule: Academic staff only see their faculty
        if (user.role === Role.YEAR_LEADER) {
            if (!user.facultyId) return res.status(403).json({ error: 'Staff member must be assigned to a faculty' });
            where.facultyId = user.facultyId;
        }

        // Student only sees their own
        if (user.role === Role.STUDENT) {
            where.studentId = user.id;
        }

        const registrations = await prisma.submission.findMany({
            where,
            include: {
                student: true,
                faculty: true,
                program: true,
                approvalLogs: {
                    include: { user: true }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        const flattenedRegistrations = registrations.map(reg => ({
            ...reg,
            studentName: reg.student.fullName,
            studentEmail: reg.student.email,
            academicStudentId: reg.student.studentId, // Add the academic student ID as a separate field
            phoneNumber: reg.student.phoneNumber || '',
            nationalId: reg.student.nationalId,
            sponsorType: reg.student.sponsorType,
            studentClass: reg.class,
            faculty: reg.faculty.name,
            program: reg.program.name,
            approvalHistory: reg.approvalLogs.map(log => ({
                role: log.user.role,
                approvedBy: log.user.fullName,
                date: log.createdAt.toISOString(),
                comments: log.comments
            }))
        }));

        res.json({ success: true, registrations: flattenedRegistrations });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const approveRegistration = async (req: any, res: Response) => {
    const { id } = req.params;
    const { comments } = req.body;
    const user = req.user;

    try {
        const submission = await prisma.submission.findUnique({
            where: { id },
            include: { student: true }
        });

        if (!submission) return res.status(404).json({ error: 'Registration not found' });

        // Faculty check for academic staff
        if (user.role === Role.YEAR_LEADER && user.facultyId !== submission.facultyId) {
            return res.status(403).json({ error: 'You can only approve registrations in your faculty' });
        }

        let nextStatus: ApprovalStatus;

        // Sequential Workflow logic
        switch (user.role) {
            case Role.YEAR_LEADER:
                if (submission.status !== ApprovalStatus.PENDING_YEAR_LEADER) return res.status(400).json({ error: 'Invalid stage' });
                nextStatus = ApprovalStatus.PENDING_FINANCE;
                break;
            case Role.FINANCE_OFFICER:
                if (submission.status !== ApprovalStatus.PENDING_FINANCE) return res.status(400).json({ error: 'Invalid stage' });
                nextStatus = ApprovalStatus.PENDING_REGISTRAR;
                break;
            case Role.REGISTRAR:
                if (submission.status !== ApprovalStatus.PENDING_REGISTRAR) return res.status(400).json({ error: 'Invalid stage' });
                nextStatus = ApprovalStatus.APPROVED;
                break;
            default:
                return res.status(403).json({ error: 'Role not authorized to approve' });
        }

        const updated = await prisma.submission.update({
            where: { id },
            data: { status: nextStatus },
            include: {
                student: true,
                faculty: true,
                program: true
            }
        });

        await prisma.approvalLog.create({
            data: {
                submissionId: id,
                userId: user.id,
                action: 'APPROVED',
                comments
            }
        });

        const currentStage = user.role === Role.YEAR_LEADER ? 'Year Leader' :
            user.role === Role.FINANCE_OFFICER ? 'Finance Department' :
                'Registrar';

        // Create In-App Notification
        if (nextStatus === ApprovalStatus.APPROVED) {
            await notificationService.createNotification(
                updated.student.id,
                'Registration Fully Approved',
                `Your registration for ${updated.semester} ${updated.academicYear} has been fully approved!`,
                NotificationType.SUCCESS
            );
        } else {
            await notificationService.createNotification(
                updated.student.id,
                'Registration Approved',
                `Your registration has been approved by ${currentStage} and is moving to the next stage.`,
                NotificationType.SUCCESS
            );
        }

        // Send email notification to student (non-blocking)
        const nextStage = nextStatus === ApprovalStatus.PENDING_FINANCE ? 'Finance Department' :
            nextStatus === ApprovalStatus.PENDING_REGISTRAR ? 'Registrar' :
                nextStatus === ApprovalStatus.APPROVED ? null : null;

        if (nextStatus === ApprovalStatus.APPROVED) {
            // Final approval
            emailService.sendFinalApprovalNotification(
                updated.student.email,
                updated.student.fullName,
                updated.faculty.name,
                updated.program?.name || 'Unknown Program',
                updated.semester,
                updated.academicYear
            ).catch(err => console.error('Background email failed:', err));
        } else {
            // Intermediate approval
            const approvalData = {
                studentEmail: updated.student.email,
                studentName: updated.student.fullName,
                approverName: user.fullName,
                approverRole: currentStage,
                currentStage
            };

            emailService.sendApprovalNotification(
                approvalData.studentEmail,
                approvalData.studentName,
                approvalData.approverName,
                approvalData.approverRole,
                approvalData.currentStage,
                nextStage || undefined
            ).catch(err => console.error('Background email failed:', err));
        }

        res.json({ success: true, submission: updated });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectRegistration = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const { comments } = req.body;
    const user = req.user;

    const updated = await prisma.submission.update({
        where: { id },
        data: { status: ApprovalStatus.REJECTED },
        include: { student: true }
    });

    await prisma.approvalLog.create({
        data: {
            submissionId: id,
            userId: user.id,
            action: 'REJECTED',
            comments
        }
    });

    const rejecterRole = user.role === Role.YEAR_LEADER ? 'Year Leader' :
        user.role === Role.FINANCE_OFFICER ? 'Finance Department' :
            'Registrar';

    // Create In-App Notification
    await notificationService.createNotification(
        updated.student.id,
        'Registration Rejected',
        `Your registration was rejected by ${rejecterRole}. Reason: ${comments || 'No reason provided.'}`,
        NotificationType.ERROR
    );

    // Send email notification to student (non-blocking)
    emailService.sendRejectionNotification(
        updated.student.email,
        updated.student.fullName,
        user.fullName,
        rejecterRole,
        comments
    ).catch(err => console.error('Background email failed:', err));

    res.json({ success: true, submission: updated });
});

