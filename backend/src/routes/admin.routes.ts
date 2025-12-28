import { Router } from 'express';
import { createStaffAccount, getAllStaff, getSystemStats, getAuditLogs } from '../controllers/admin.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/create-staff', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), createStaffAccount);
router.get('/staff', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), getAllStaff);
router.get('/stats', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), getSystemStats);
router.get('/audit-logs', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), getAuditLogs);

export default router;
