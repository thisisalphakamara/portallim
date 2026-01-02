import { useState, useEffect } from 'react';
import { notificationService, Notification } from '../services/notification.service';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications();
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        setUnreadCount(result.notifications.filter(n => !n.read).length);
        setError(null);
      } else {
        setError(result.error || 'Failed to load notifications');
      }
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      } else {
        setError(result.error || 'Failed to mark as read');
        return false;
      }
    } catch (err) {
      setError('Failed to mark as read');
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        return true;
      } else {
        setError(result.error || 'Failed to mark all as read');
        return false;
      }
    } catch (err) {
      setError('Failed to mark all as read');
      return false;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return true;
      } else {
        setError(result.error || 'Failed to delete notification');
        return false;
      }
    } catch (err) {
      setError('Failed to delete notification');
      return false;
    }
  };

  const clearAllNotifications = async () => {
    try {
      const result = await notificationService.clearAllNotifications();
      if (result.success) {
        setNotifications([]);
        setUnreadCount(0);
        return true;
      } else {
        setError(result.error || 'Failed to clear notifications');
        return false;
      }
    } catch (err) {
      setError('Failed to clear notifications');
      return false;
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };
};
