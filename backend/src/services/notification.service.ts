import { prisma } from '../index';
import { NotificationType } from '@prisma/client';

class NotificationService {
    async createNotification(
        userId: string,
        title: string,
        message: string,
        type: NotificationType = NotificationType.INFO
    ) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                    read: false
                }
            });
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            // We don't throw here to avoid failing the main transaction if notification fails
            return null;
        }
    }

    async getUserNotifications(userId: string) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async markAsRead(notificationId: string, userId: string) {
        return prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId // Security: Ensure user owns notification
            },
            data: { read: true }
        });
    }

    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId },
            data: { read: true }
        });
    }

    async deleteNotification(notificationId: string, userId: string) {
        return prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId // Security: Ensure user owns notification
            }
        });
    }

    async clearAllNotifications(userId: string) {
        return prisma.notification.deleteMany({
            where: { userId }
        });
    }

    async getUnreadCount(userId: string) {
        return prisma.notification.count({
            where: {
                userId,
                read: false
            }
        });
    }
}

export const notificationService = new NotificationService();
