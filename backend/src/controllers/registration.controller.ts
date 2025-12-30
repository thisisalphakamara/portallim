import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApprovalStatus, Role } from '@prisma/client';

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

        const existingSubmission = await prisma.submission.findFirst({
            where: {
                studentId: student.id,
                semester,
                academicYear
            }
        });

        if (existingSubmission) {
            return res.status(409).json({
                error: `Registration already submitted for ${semester} ${academicYear}.`
            });
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

        res.status(201).json({ success: true, submission });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: `Registration already exists for ${semester} ${academicYear}.`
            });
        }
        res.status(500).json({ error: error.message });
    }
};

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

        res.json({ success: true, submission: updated });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
