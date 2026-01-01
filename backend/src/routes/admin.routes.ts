import { Router } from 'express';
import { createStaffAccount, getAllStaff, getSystemStats, getAuditLogs, runSystemBackup, clearSystemCache, exportAuditLogs } from '../controllers/admin.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/create-staff', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), createStaffAccount);
router.get('/staff', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), getAllStaff);
router.get('/stats', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), getSystemStats);
router.get('/audit-logs', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), getAuditLogs);
router.post('/backup', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), runSystemBackup);
router.post('/clear-cache', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), clearSystemCache);
router.get('/export-logs', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), exportAuditLogs);

export default router;
