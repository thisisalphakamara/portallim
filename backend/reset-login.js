const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetLoginAttempts() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        email: 'system.admin@limkokwing.edu.sl'
      },
      data: {
        loginAttempts: 0,
        lockedUntil: null
      }
    });
    
    console.log('Reset login attempts for', result.count, 'user(s)');
    console.log('You can now try logging in again.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetLoginAttempts();
