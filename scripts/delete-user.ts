import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
  try {
    const email = 'haim.derazon@gmail.com';

    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { email },
    });

    console.log('✅ User deleted successfully:', deletedUser.email);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
