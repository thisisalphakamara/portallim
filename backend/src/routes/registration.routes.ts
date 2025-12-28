import { Router } from 'express';
import {
    submitRegistration,
    getRegistrations,
    approveRegistration,
    rejectRegistration
} from '../controllers/registration.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/submit', authenticateToken, submitRegistration);
router.get('/', authenticateToken, getRegistrations);
router.post('/:id/approve', authenticateToken, approveRegistration);
router.post('/:id/reject', authenticateToken, rejectRegistration);

export default router;
