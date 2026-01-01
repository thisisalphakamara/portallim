import { Router } from 'express';
import { login, changePassword, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, commonValidations } from '../middleware/validation.middleware';

const router = Router();

router.post('/login', validate([commonValidations.email, {
  field: 'password',
  required: true,
  type: 'string',
  minLength: 1,
  maxLength: 128
}]), login);

router.post('/change-password', authenticateToken, validate([{
  field: 'newPassword',
  required: true,
  type: 'string',
  minLength: 8,
  maxLength: 128,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  custom: (value: string) => {
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
    return null;
  }
}]), changePassword);

router.get('/me', authenticateToken, getMe);

export default router;
