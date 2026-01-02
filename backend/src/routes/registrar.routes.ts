import { Router } from 'express';
import { createStudentAccount, getStudents, deleteStudentAccount } from '../controllers/registrar.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validate, commonValidations } from '../middleware/validation.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/create-student', 
  authenticateToken, 
  authorizeRoles(Role.REGISTRAR, Role.SYSTEM_ADMIN),
  validate([
    commonValidations.email,
    commonValidations.fullName,
    commonValidations.studentId,
    {
      field: 'facultyId',
      required: true,
      type: 'string',
      custom: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Faculty is required';
        }
        return null;
      }
    },
    {
      field: 'programId',
      required: true,
      type: 'string',
      custom: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Program is required';
        }
        return null;
      }
    },
    {
      field: 'password',
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
    },
    commonValidations.nationalId,
    {
      field: 'passportNumber',
      required: false,
      type: 'string',
      minLength: 6,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9-]+$/,
      sanitize: true
    },
    {
      field: 'currentYear',
      required: false,
      type: 'number',
      min: 1,
      max: 4
    },
    {
      field: 'phoneNumber',
      required: false,
      type: 'string',
      pattern: /^\+?[\d\s\-\(\)]+$/,
      maxLength: 20,
      sanitize: true
    },
    {
      field: 'sponsorType',
      required: false,
      type: 'string',
      enum: ['Self-sponsored', 'Government', 'Private Sponsor', 'Scholarship'],
      sanitize: true
    }
  ]), 
  createStudentAccount
);

router.get('/students', authenticateToken, authorizeRoles(Role.REGISTRAR, Role.SYSTEM_ADMIN), getStudents);

router.delete('/students/:email', authenticateToken, authorizeRoles(Role.REGISTRAR, Role.SYSTEM_ADMIN), deleteStudentAccount);

export default router;
