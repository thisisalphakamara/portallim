import { api } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface NotificationResponse {
  success: boolean;
  notifications?: Notification[];
  error?: string;
}

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (): Promise<NotificationResponse> => {
    try {
      const response = await api.get('/notifications');
      return {
        success: true,
        notifications: response.notifications || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch notifications'
      };
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.put(`/notifications/${notificationId}/read`, {});
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to mark notification as read'
      };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.put('/notifications/mark-all-read', {});
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to mark all notifications as read'
      };
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete notification'
      };
    }
  },

  // Clear all notifications
  clearAllNotifications: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete('/notifications');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to clear notifications'
      };
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      const response = await api.get('/notifications/unread-count');
      return {
        success: true,
        count: response.count || 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get unread count'
      };
    }
  }
};
