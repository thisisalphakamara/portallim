import { Request, Response } from 'express';
import { prisma } from '../index';
import { supabase } from '../utils/supabase';
import { Role } from '@prisma/client';

export const createStaffAccount = async (req: any, res: Response) => {
    const { email, fullName, role, facultyId, password, nationalId, passportNumber } = req.body;

    console.log('=== STAFF ACCOUNT CREATION DEBUG ===');
    console.log('Request body:', { email, fullName, role, facultyId, nationalId, passportNumber });

    // Verify requester is System Admin
    if (req.user.role !== Role.SYSTEM_ADMIN) {
        console.log('ERROR: Not system admin');
        return res.status(403).json({ error: 'Only System Admin can create staff accounts' });
    }

    try {
        // Validate email format based on role
        const emailLower = email.toLowerCase();

        // Extract first name from full name for validation
        const firstName = fullName.trim().split(/\s+/)[0].toLowerCase();

        if (role === Role.REGISTRAR) {
            // Expected format: firstname.registrar@limkokwing.edu.sl
            const expectedPattern = /^[a-z]+\.registrar@limkokwing\.edu\.sl$/;
            if (!expectedPattern.test(emailLower)) {
                return res.status(400).json({
                    error: `Registrar email must follow format: {firstname}.registrar@limkokwing.edu.sl (e.g., ${firstName}.registrar@limkokwing.edu.sl)`
                });
            }
        } else if (role === Role.FINANCE_OFFICER) {
            // Expected format: firstname.finance@limkokwing.edu.sl
            const expectedPattern = /^[a-z]+\.finance@limkokwing\.edu\.sl$/;
            if (!expectedPattern.test(emailLower)) {
                return res.status(400).json({
                    error: `Finance Officer email must follow format: {firstname}.finance@limkokwing.edu.sl (e.g., ${firstName}.finance@limkokwing.edu.sl)`
                });
            }
        } else if (role === Role.YEAR_LEADER) {
            // Year leader email must be in format: firstname.yearleader.{facultyAbbr}@limkokwing.edu.sl
            if (!facultyId) {
                return res.status(400).json({
                    error: 'Faculty must be assigned for Year Leader role'
                });
            }

            // Get faculty details
            const faculty = await prisma.faculty.findUnique({
                where: { id: facultyId }
            });

            if (!faculty) {
                return res.status(400).json({ error: 'Invalid faculty selected' });
            }

            // Extract faculty abbreviation from faculty name
            let facultyAbbr = '';

            // First, try to extract abbreviation from parentheses
            const abbrMatch = faculty.name.match(/\(([A-Z]+)\)/);
            if (abbrMatch) {
                facultyAbbr = abbrMatch[1].toLowerCase();
            } else {
                // Fallback: extract from faculty name
                facultyAbbr = faculty.name
                    .toLowerCase()
                    .replace(/faculty of /i, '')
                    .replace(/\s+/g, '')
                    .replace(/[^a-z]/g, '');
            }

            // Expected format: firstname.yearleader.fict@limkokwing.edu.sl
            const expectedPattern = new RegExp(`^[a-z]+\\.yearleader\\.${facultyAbbr}@limkokwing\\.edu\\.sl$`);
            const expectedEmail = `${firstName}.yearleader.${facultyAbbr}@limkokwing.edu.sl`;

            if (!expectedPattern.test(emailLower)) {
                return res.status(400).json({
                    error: `Year Leader email for ${faculty.name} must follow format: {firstname}.yearleader.${facultyAbbr}@limkokwing.edu.sl (e.g., ${expectedEmail})`
                });
            }
        }

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
            return res.status(500).json({ error: 'Failed to check Supabase Auth' });
        }

        const emailExistsInSupabase = existingSupabaseUsers.users.some(user => user.email === email);
        console.log('Supabase Auth result:', emailExistsInSupabase ? 'EMAIL FOUND' : 'EMAIL NOT FOUND');

        // Email must be unique for all roles
        if (existingUser && emailExistsInSupabase) {
            console.log('ERROR: Complete user exists in both systems');
            return res.status(400).json({
                error: 'A user with this email address has already been registered'
            });
        }

        // Clean up partial registrations if needed
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

        // Check for duplicate national ID
        if (nationalId) {
            const duplicateNationalId = await prisma.user.findFirst({
                where: { nationalId }
            });
            if (duplicateNationalId) {
                return res.status(400).json({
                    error: 'A user with this national ID already exists'
                });
            }
        }

        // Check for duplicate passport
        if (passportNumber) {
            const duplicatePassport = await prisma.user.findFirst({
                where: { passportNumber }
            });
            if (duplicatePassport) {
                return res.status(400).json({
                    error: 'A user with this passport number already exists'
                });
            }
        }

        console.log('All checks passed, proceeding with user creation...');

        // Generate unique staff identifier
        const staffIdentifier = `${role.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        console.log('Generated staff identifier:', staffIdentifier);

        // 1. Create user in Supabase Auth
        console.log('Creating user in Supabase Auth with email:', email);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                fullName,
                role,
                staffIdentifier
            }
        });

        if (authError) {
            console.log('ERROR: Supabase Auth creation failed:', authError);
            return res.status(400).json({ error: authError.message });
        }

        console.log('Supabase Auth user created successfully:', authData.user.id);

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

        // 3. Log the account creation in audit log
        await prisma.auditLog.create({
            data: {
                action: 'ACCOUNT_CREATED',
                performedBy: req.user.id,
                targetUser: newUser.id,
                details: `Created ${role} account for ${fullName} (${email})`,
                ipAddress: req.ip || 'Unknown'
            }
        });

        res.status(201).json({
            success: true,
            user: newUser,
            temporaryPassword: password
        });
    } catch (error: any) {
        console.error('Create staff error:', error);

        // Handle unique constraint violations
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target?.includes('nationalId')) {
                return res.status(400).json({ error: 'A user with this national ID already exists' });
            }
            if (target?.includes('passportNumber')) {
                return res.status(400).json({ error: 'A user with this passport number already exists' });
            }
            if (target?.includes('email')) {
                return res.status(400).json({ error: 'A user with this email already exists' });
            }
            if (target?.includes('staffIdentifier')) {
                return res.status(400).json({ error: 'Staff identifier conflict. Please try again.' });
            }
        }

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
        console.log('Fetching all audit logs');

        let auditLogs: any[] = [];
        let approvalLogs: any[] = [];

        // Fetch from AuditLog table (account creations, logins, etc.)
        try {
            auditLogs = await prisma.auditLog.findMany({
                include: {
                    user: true,
                    target: true
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });
            console.log(`Found ${auditLogs.length} audit logs`);
        } catch (auditError) {
            console.error('Error fetching audit logs:', auditError);
            // Continue even if audit logs fail
        }

        // Fetch from ApprovalLog table (registration approvals)
        try {
            approvalLogs = await prisma.approvalLog.findMany({
                include: {
                    user: true,
                    submission: {
                        include: { student: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });
            console.log(`Found ${approvalLogs.length} approval logs`);
        } catch (approvalError) {
            console.error('Error fetching approval logs:', approvalError);
            // Continue even if approval logs fail
        }

        // Format audit logs
        const formattedAuditLogs = auditLogs.map(log => ({
            id: log.id,
            action: log.action,
            performedBy: log.user.fullName,
            role: log.user.role,
            targetUser: log.target?.fullName || 'N/A',
            details: log.details || 'No details provided',
            timestamp: log.createdAt.toISOString(),
            ipAddress: log.ipAddress || 'Unknown'
        }));

        // Format approval logs
        const formattedApprovalLogs = approvalLogs.map(log => ({
            id: log.id,
            action: log.action,
            performedBy: log.user.fullName,
            role: log.user.role,
            targetUser: log.submission?.student?.fullName || 'N/A',
            details: log.comments || 'No details provided',
            timestamp: log.createdAt.toISOString(),
            ipAddress: 'System'
        }));

        // Combine and sort by timestamp
        const allLogs = [...formattedAuditLogs, ...formattedApprovalLogs]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        console.log(`Total combined logs: ${allLogs.length}`);
        console.log('Sending response with', allLogs.length, 'logs');

        res.json({ success: true, logs: allLogs });
    } catch (error: any) {
        console.error('ERROR in getAuditLogs:', error);
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

export const runSystemBackup = async (req: any, res: Response) => {
    try {
        // Simulate system backup process
        const backupStartTime = new Date();

        // In a real implementation, this would:
        // 1. Create database backup
        // 2. Backup file storage
        // 3. Create system state snapshot

        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate backup process

        const backupEndTime = new Date();
        const backupDuration = Math.round((backupEndTime.getTime() - backupStartTime.getTime()) / 1000);

        console.log(`System backup completed by ${req.user.email} in ${backupDuration} seconds`);

        res.json({
            success: true,
            message: 'System backup completed successfully',
            backupTime: backupEndTime.toISOString(),
            duration: `${backupDuration} seconds`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const clearSystemCache = async (req: any, res: Response) => {
    try {
        const cacheClearStartTime = new Date();

        // In a real implementation, this would:
        // 1. Clear Redis cache
        // 2. Clear application cache
        // 3. Clear session cache where appropriate

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate cache clearing

        const cacheClearEndTime = new Date();

        console.log(`System cache cleared by ${req.user.email}`);

        res.json({
            success: true,
            message: 'System cache cleared successfully',
            clearedAt: cacheClearEndTime.toISOString()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const exportAuditLogs = async (req: any, res: Response) => {
    try {
        const { startDate, endDate, format = 'json' } = req.query;

        // Build date filter
        let dateFilter: any = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
            if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
        }

        // Fetch logs with optional date filtering
        const logs = await prisma.approvalLog.findMany({
            where: dateFilter,
            include: {
                user: true,
                submission: {
                    include: { student: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 1000 // Limit to prevent large exports
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

        console.log(`Audit logs exported by ${req.user.email}: ${formattedLogs.length} logs`);

        if (format === 'csv') {
            // Convert to CSV format
            const csvHeader = 'ID,Action,Performed By,Role,Target User,Details,Timestamp,IP Address\n';
            const csvData = formattedLogs.map(log =>
                `"${log.id}","${log.action}","${log.performedBy}","${log.role}","${log.targetUser}","${log.details}","${log.timestamp}","${log.ipAddress}"`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvHeader + csvData);
        } else {
            // Default JSON format
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`);
            res.json({
                success: true,
                exportDate: new Date().toISOString(),
                totalLogs: formattedLogs.length,
                logs: formattedLogs
            });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

