import { Router } from 'express';
import {
    submitRegistration,
    getRegistrations,
    approveRegistration,
    rejectRegistration
} from '../controllers/registration.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, commonValidations } from '../middleware/validation.middleware';

const router = Router();

router.post('/submit', authenticateToken, submitRegistration);

router.get('/', authenticateToken, getRegistrations);

router.post('/:id/approve', authenticateToken, validate([
  {
    field: 'comments',
    required: false,
    type: 'string',
    maxLength: 500,
    sanitize: true
  }
]), approveRegistration);

router.post('/:id/reject', authenticateToken, validate([
  {
    field: 'comments',
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 500,
    sanitize: true,
    custom: (value: string) => {
      if (value.trim().length < 5) {
        return 'Rejection reason must be at least 5 characters long';
      }
      return null;
    }
  }
]), rejectRegistration);

export default router;
