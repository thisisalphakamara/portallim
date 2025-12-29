import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApprovalStatus, Role } from '@prisma/client';
import { notifyStudent } from '../services/notification.service';

const buildRecipientFromUser = (user: any) => ({
    email: user.email,
    phoneNumber: user.phoneNumber,
    fullName: user.fullName
});

const stageNotifications: Record<Role, { subject: string; message: (submission: any) => string }> = {
    [Role.YEAR_LEADER]: {
        subject: 'Registration Received by Year Leader',
        message: (submission) =>
            `Your registration for ${submission.semester} ${submission.academicYear} has been approved by the Year Leader and is now forwarded to the Faculty Admin for review.`
    },
    [Role.FACULTY_ADMIN]: {
        subject: 'Faculty Admin Approval Complete',
        message: (submission) =>
            `The Faculty Admin within ${submission.faculty.name} has approved your registration for ${submission.semester} ${submission.academicYear} and forwarded it to the Finance Department.`
    },
    [Role.FINANCE_OFFICER]: {
        subject: 'Finance Verification Complete',
        message: (submission) =>
            `Finance has verified payment for your registration (${submission.semester} ${submission.academicYear}) and it has been routed to the Registrar for final approval.`
    },
    [Role.REGISTRAR]: {
        subject: 'Registration Fully Approved',
        message: (submission) =>
            `Your registration for ${submission.semester} ${submission.academicYear} has received the Registrar's final approval. You are fully registered for the semester.`
    },
    [Role.SYSTEM_ADMIN]: {
        subject: 'System Update',
        message: () => 'An administrative role made a change to your registration.'
    },
    [Role.STUDENT]: {
        subject: 'Registration Update',
        message: () => 'Your registration status changed.'
    }
};

export const submitRegistration = async (req: any, res: Response) => {
    const { semester, academicYear, modules, enrollmentIntake, yearLevel } = req.body;
    const student = req.user;

    if (student.role !== Role.STUDENT) {
        return res.status(403).json({ error: 'Only students can submit registrations' });
    }

    try {
        // Check if faculty and program are assigned
        if (!student.facultyId || !student.programId) {
            return res.status(400).json({ error: 'Student must have a faculty and program assigned' });
        }

        const submission = await prisma.submission.create({
            data: {
                studentId: student.id,
                facultyId: student.facultyId,
                programId: student.programId,
                semester,
                academicYear,
                enrollmentIntake,
                yearLevel,
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

        try {
            await notifyStudent(
                buildRecipientFromUser(student),
                'Registration Submitted',
                `Your registration for ${semester} ${academicYear} has been submitted and routed to your faculty Year Leader (${student.faculty?.name || 'Faculty'}) for review.`
            );
        } catch (notificationError) {
            console.error('Failed to send submission notification:', notificationError);
        }

        res.status(201).json({ success: true, submission });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getRegistrations = async (req: any, res: Response) => {
    const user = req.user;

    try {
        let where: any = {};

        // Faculty-based routing rule: Academic staff only see their faculty
        if (user.role === Role.YEAR_LEADER || user.role === Role.FACULTY_ADMIN) {
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
        if ((user.role === Role.YEAR_LEADER || user.role === Role.FACULTY_ADMIN) && user.facultyId !== submission.facultyId) {
            return res.status(403).json({ error: 'You can only approve registrations in your faculty' });
        }

        let nextStatus: ApprovalStatus;

        // Sequential Workflow logic
        switch (user.role) {
            case Role.YEAR_LEADER:
                if (submission.status !== ApprovalStatus.PENDING_YEAR_LEADER) return res.status(400).json({ error: 'Invalid stage' });
                nextStatus = ApprovalStatus.PENDING_FACULTY_ADMIN;
                break;
            case Role.FACULTY_ADMIN:
                if (submission.status !== ApprovalStatus.PENDING_FACULTY_ADMIN) return res.status(400).json({ error: 'Invalid stage' });
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
                faculty: true
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
        try {
            const notification = stageNotifications[user.role as Role];
            if (notification && updated.student) {
                await notifyStudent(
                    buildRecipientFromUser(updated.student),
                    notification.subject,
                    notification.message(updated)
                );
            }
        } catch (notificationError) {
            console.error('Failed to send approval notification:', notificationError);
        }

        res.json({ success: true, submission: updated });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectRegistration = async (req: any, res: Response) => {
    const { id } = req.params;
    const { comments } = req.body;
    const user = req.user;

    try {
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

        try {
            await notifyStudent(
                buildRecipientFromUser(updated.student),
                'Registration Rejected',
                `Your registration was rejected by ${user.role.replace('_', ' ').toLowerCase()}. Comments: ${comments || 'No reason provided'}.`
            );
        } catch (notificationError) {
            console.error('Failed to send rejection notification:', notificationError);
        }

        res.json({ success: true, submission: updated });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
