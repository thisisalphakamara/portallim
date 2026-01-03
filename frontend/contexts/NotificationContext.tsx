import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../services/notification.service';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    refreshNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<boolean>;
    markAllAsRead: () => Promise<boolean>;
    deleteNotification: (notificationId: string) => Promise<boolean>;
    clearAllNotifications: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const notificationData = useNotifications();

    return (
        <NotificationContext.Provider value={notificationData}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
