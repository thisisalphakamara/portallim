import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { asyncHandler } from '../middleware/error.middleware';

export const getNotifications = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;
  const notifications = await notificationService.getUserNotifications(userId);

  res.json({
    success: true,
    notifications
  });
});

export const markAsRead = asyncHandler(async (req: any, res: Response) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  await notificationService.markAsRead(notificationId, userId);

  res.json({ success: true });
});

export const markAllAsRead = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;

  await notificationService.markAllAsRead(userId);

  res.json({ success: true });
});

export const deleteNotification = asyncHandler(async (req: any, res: Response) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  await notificationService.deleteNotification(notificationId, userId);

  res.json({ success: true });
});

export const clearAllNotifications = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;

  await notificationService.clearAllNotifications(userId);

  res.json({ success: true });
});

export const getUnreadCount = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;

  const count = await notificationService.getUnreadCount(userId);

  res.json({
    success: true,
    count
  });
});
