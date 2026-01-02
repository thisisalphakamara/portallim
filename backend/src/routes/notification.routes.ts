import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
} from '../controllers/notification.controller';

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

router.get('/', getNotifications);
router.put('/:notificationId/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:notificationId', deleteNotification);
router.delete('/', clearAllNotifications);
router.get('/unread-count', getUnreadCount);

export default router;
