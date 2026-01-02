import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the enum locally since it's in the schema
enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

async function createTestNotifications() {
  try {
    // Get all users
    const users = await prisma.user.findMany();
    
    for (const user of users) {
      // Create a welcome notification for each user
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to LIM Portal',
          message: `Hello ${user.fullName}, welcome to the Limkokwing University Portal!`,
          type: NotificationType.INFO,
          read: false
        }
      });

      // Create role-specific notifications
      if (user.role === 'STUDENT') {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Registration Status',
            message: 'Your registration is currently being processed. Please check back for updates.',
            type: NotificationType.WARNING,
            read: false
          }
        });
      } else if (user.role === 'YEAR_LEADER' || user.role === 'FINANCE_OFFICER' || user.role === 'REGISTRAR') {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Pending Approvals',
            message: 'You have pending registration approvals that require your attention.',
            type: NotificationType.WARNING,
            read: false
          }
        });
      } else if (user.role === 'SYSTEM_ADMIN') {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'System Update',
            message: 'The notification system has been successfully implemented and is now active.',
            type: NotificationType.SUCCESS,
            read: false
          }
        });
      }
    }

    console.log('Test notifications created successfully!');
  } catch (error) {
    console.error('Error creating test notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();
