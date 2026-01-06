import { Request, Response } from 'express';
import { prisma } from '../index';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { Role } from '@prisma/client';

export const getSystemSettings = asyncHandler(async (req: Request, res: Response) => {
    let settings = await prisma.systemSettings.findFirst();

    // Seed if missing
    if (!settings) {
        settings = await prisma.systemSettings.create({
            data: {
                currentAcademicYear: '2025/2026',
                currentSession: 'March - June',
                isRegistrationOpen: true
            }
        });
    }

    res.json({
        success: true,
        settings
    });
});

export const updateSystemSettings = asyncHandler(async (req: any, res: Response) => {
    const { currentAcademicYear, currentSession, isRegistrationOpen } = req.body;
    const user = req.user;

    if (user.role !== Role.SYSTEM_ADMIN) {
        throw new AppError('Only System Admin can update settings', 403);
    }

    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
        // Should not happen if get is called first, but handle it
        settings = await prisma.systemSettings.create({
            data: {
                currentAcademicYear,
                currentSession,
                isRegistrationOpen: isRegistrationOpen ?? true
            }
        });
    } else {
        settings = await prisma.systemSettings.update({
            where: { id: settings.id },
            data: {
                currentAcademicYear,
                currentSession,
                isRegistrationOpen
            }
        });
    }

    // Audit log
    await prisma.auditLog.create({
        data: {
            action: 'UPDATE_SETTINGS',
            performedBy: user.id,
            details: `Updated settings to ${currentAcademicYear} - ${currentSession}`,
            ipAddress: req.ip || 'Unknown'
        }
    });

    res.json({
        success: true,
        settings,
        message: 'System settings updated successfully'
    });
});
