import { Request, Response } from 'express';

// Mock notifications data for now
const mockNotifications = [
  {
    id: '1',
    title: 'Welcome to LIM Portal',
    message: 'Hello! Welcome to the Limkokwing University Portal!',
    type: 'info',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    title: 'System Update',
    message: 'The notification system has been successfully implemented.',
    type: 'success',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false
  }
];

export const getNotifications = async (req: Request, res: Response) => {
  try {
    // For now, return mock data
    res.json({
      success: true,
      notifications: mockNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    // Find and mark as read in mock data
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    // Mark all as read in mock data
    mockNotifications.forEach(n => n.read = true);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const index = mockNotifications.findIndex(n => n.id === notificationId);
    
    if (index > -1) {
      mockNotifications.splice(index, 1);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    // Clear all mock notifications
    mockNotifications.length = 0;

    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear notifications'
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = mockNotifications.filter(n => !n.read).length;

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
};
