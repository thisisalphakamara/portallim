import { Request, Response } from 'express';
import { prisma } from '../index';
import { supabase } from '../utils/supabase';
import { Role } from '@prisma/client';

export const createStaffAccount = async (req: any, res: Response) => {
    const { email, fullName, role, facultyId, password, nationalId, passportNumber } = req.body;

    // Verify requester is System Admin
    if (req.user.role !== Role.SYSTEM_ADMIN) {
        return res.status(403).json({ error: 'Only System Admin can create staff accounts' });
    }

    try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { fullName, role }
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        // 2. Create user in Prisma DB
        const newUser = await prisma.user.create({
            data: {
                email,
                fullName,
                role: role as Role,
                supabaseId: authData.user.id,
                facultyId: facultyId || null,
                nationalId,
                passportNumber,
                isFirstLogin: false
            }
        });

        res.status(201).json({
            success: true,
            user: newUser,
            temporaryPassword: password
        });
    } catch (error: any) {
        console.error('Create staff error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getSystemStats = async (req: any, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeStudents = await prisma.user.count({ where: { role: Role.STUDENT } });
        const staffMembers = await prisma.user.count({
            where: {
                role: { in: [Role.REGISTRAR, Role.FINANCE_OFFICER, Role.YEAR_LEADER, Role.SYSTEM_ADMIN] }
            }
        });
        const pendingRegistrations = await prisma.submission.count({
            where: {
                status: { notIn: ['APPROVED', 'REJECTED'] }
            }
        });
        const facultyCountsRaw = await prisma.faculty.findMany({
            include: {
                _count: {
                    select: {
                        submissions: true
                    }
                }
            }
        });
        const facultyCounts = facultyCountsRaw.map((faculty) => ({
            faculty: faculty.name,
            count: faculty._count.submissions
        }));

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeStudents,
                staffMembers,
                pendingRegistrations,
                facultyCounts,
                systemUptime: '99.9%', // Mocked for simplicity
                lastBackup: new Date().toISOString()
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAuditLogs = async (req: any, res: Response) => {
    try {
        const logs = await prisma.approvalLog.findMany({
            include: {
                user: true,
                submission: {
                    include: { student: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        const formattedLogs = logs.map(log => ({
            id: log.id,
            action: log.action,
            performedBy: log.user.fullName,
            role: log.user.role,
            targetUser: log.submission?.student?.fullName || 'N/A',
            details: log.comments || 'No details provided',
            timestamp: log.createdAt.toISOString(),
            ipAddress: 'System' // We don't track IPs yet
        }));

        res.json({ success: true, logs: formattedLogs });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllStaff = async (req: any, res: Response) => {
    try {
        const staff = await prisma.user.findMany({
            where: {
                role: {
                    in: [Role.REGISTRAR, Role.FINANCE_OFFICER, Role.YEAR_LEADER]
                }
            },
            include: { faculty: true }
        });

        const flattenedStaff = staff.map(s => ({
            ...s,
            name: s.fullName,
            faculty: s.faculty?.name
        }));

        res.json({ success: true, staff: flattenedStaff });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
