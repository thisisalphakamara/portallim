import { Router } from 'express';
import { uploadProfilePhoto, uploadPhotoMiddleware } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/upload-photo', authenticateToken, uploadPhotoMiddleware, uploadProfilePhoto);

export default router;
