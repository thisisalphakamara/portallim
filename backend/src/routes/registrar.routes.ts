import { Router } from 'express';
import { createStudentAccount, getStudents } from '../controllers/registrar.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/create-student', authenticateToken, authorizeRoles(Role.REGISTRAR, Role.SYSTEM_ADMIN), createStudentAccount);
router.get('/students', authenticateToken, authorizeRoles(Role.REGISTRAR, Role.SYSTEM_ADMIN), getStudents);

export default router;
