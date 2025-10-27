import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@secondhand.co.za' },
  });

  if (adminUser) {
    console.log('✅ Admin user found:');
    console.log('ID:', adminUser.id);
    console.log('Email:', adminUser.email);
    console.log('Name:', adminUser.name);
    console.log('Role:', adminUser.role);
    console.log('Email Verified:', adminUser.emailVerified);
    console.log('Lockout Until:', adminUser.lockoutUntil);
    console.log('Failed Login Attempts:', adminUser.failedLoginAttempts);
  } else {
    console.log('❌ Admin user not found in database');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
