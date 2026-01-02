const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Check current users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nationalId: true,
        passportNumber: true,
        fullName: true
      }
    });
    
    console.log(`Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`- ${user.fullName} (${user.email}) - ID: ${user.nationalId || 'N/A'}, Passport: ${user.passportNumber || 'N/A'}`);
    });
    
    // Delete all users and related data
    console.log('\nDeleting all registration documents...');
    await prisma.registrationDocument.deleteMany({});
    
    console.log('Deleting all approval logs...');
    await prisma.approvalLog.deleteMany({});
    
    console.log('Deleting all submissions...');
    await prisma.submission.deleteMany({});
    
    console.log('Deleting all users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ Database cleanup completed successfully!');
    
    // Verify cleanup
    const remainingUsers = await prisma.user.count();
    console.log(`\nVerification: ${remainingUsers} users remaining in database`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase();
