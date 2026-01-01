import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'array' | 'object' | 'boolean';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  enum?: string[];
  sanitize?: boolean;
}

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const sanitized: any = {};

    for (const rule of rules) {
      const value = req.body[rule.field];
      
      // Check if required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${rule.field} must be a string`);
              continue;
            }
            break;
          case 'number':
            const numValue = Number(value);
            if (isNaN(numValue)) {
              errors.push(`${rule.field} must be a number`);
              continue;
            }
            sanitized[rule.field] = numValue;
            break;
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof value !== 'string' || !emailRegex.test(value)) {
              errors.push(`${rule.field} must be a valid email address`);
              continue;
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${rule.field} must be an array`);
              continue;
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${rule.field} must be true or false`);
              continue;
            }
            break;
          case 'object':
            if (typeof value !== 'object' || Array.isArray(value)) {
              errors.push(`${rule.field} must be an object`);
              continue;
            }
            break;
        }
      }

      // Length validation for strings
      if (rule.type === 'string' || rule.type === 'email') {
        const strValue = String(value);
        if (rule.minLength && strValue.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
        }
        if (rule.maxLength && strValue.length > rule.maxLength) {
          errors.push(`${rule.field} must not exceed ${rule.maxLength} characters`);
        }
      }

      // Range validation for numbers
      if (rule.type === 'number') {
        const numValue = Number(value);
        if (rule.min !== undefined && numValue < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && numValue > rule.max) {
          errors.push(`${rule.field} must not exceed ${rule.max}`);
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push(`${rule.field} format is invalid`);
        }
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${rule.field} must be one of: ${rule.enum.join(', ')}`);
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }

      // Sanitization
      if (rule.sanitize && typeof value === 'string') {
        sanitized[rule.field] = value.trim();
      } else if (!(rule.field in sanitized)) {
        sanitized[rule.field] = value;
      }
    }

    if (errors.length > 0) {
      return next(new AppError(`Validation failed: ${errors.join(', ')}`, 400));
    }

    // Merge sanitized data back to request body
    Object.assign(req.body, sanitized);
    next();
  };
};

// Common validation rules
export const commonValidations = {
  email: {
    field: 'email',
    required: true,
    type: 'email' as const,
    maxLength: 255,
    sanitize: true
  },
  password: {
    field: 'password',
    required: true,
    type: 'string' as const,
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
  fullName: {
    field: 'fullName',
    required: true,
    type: 'string' as const,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    sanitize: true
  },
  studentId: {
    field: 'studentId',
    required: true,
    type: 'string' as const,
    minLength: 5,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9-]+$/,
    sanitize: true
  },
  nationalId: {
    field: 'nationalId',
    required: false,
    type: 'string' as const,
    minLength: 8,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9-]+$/,
    sanitize: true
  },
  semester: {
    field: 'semester',
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 50,
    sanitize: true
  },
  academicYear: {
    field: 'academicYear',
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 50,
    sanitize: true
  },
  yearLevel: {
    field: 'yearLevel',
    required: true,
    type: 'number' as const,
    min: 1,
    max: 4
  },
  enrollmentIntake: {
    field: 'enrollmentIntake',
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 50,
    sanitize: true
  },
  modules: {
    field: 'modules',
    required: true,
    type: 'array' as const,
    custom: (value: any[]) => {
      if (!Array.isArray(value) || value.length === 0) {
        return 'At least one module must be selected';
      }
      if (value.length > 10) {
        return 'Cannot select more than 10 modules';
      }
      // Validate each module has required fields
      for (const module of value) {
        if (!module.id || !module.name || !module.code) {
          return 'Each module must have id, name, and code';
        }
      }
      return null;
    }
  },
  comments: {
    field: 'comments',
    required: false,
    type: 'string' as const,
    maxLength: 500,
    sanitize: true
  }
};
