import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@secondhand.co.za' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (adminUser) {
    console.log('✅ Admin user found:');
    console.log(JSON.stringify(adminUser, null, 2));
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
