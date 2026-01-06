import { Router } from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/settings.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Publicly readable (authenticated users)
router.get('/', authenticateToken, getSystemSettings);

// Admin write
router.put('/', authenticateToken, updateSystemSettings);

export default router;
