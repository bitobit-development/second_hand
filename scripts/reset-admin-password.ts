import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'Admin123!';
  const hash = await bcrypt.hash(newPassword, 10);

  const result = await prisma.user.update({
    where: { email: 'admin@secondhand.co.za' },
    data: { password: hash }
  });

  console.log('✅ Admin password updated successfully');
  console.log('Email:', result.email);
  console.log('New password: Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
