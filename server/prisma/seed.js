import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Check if Admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.username);
    return;
  }

  // Create Admin user
  const hashedPassword = await bcrypt.hash('sandro', 10);

  const admin = await prisma.user.create({
    data: {
      phone: '+000000000000',
      phoneVerified: true,
      role: 'admin',
      username: 'Admin',
      password: hashedPassword
    }
  });

  console.log('Admin user created successfully:');
  console.log('  Username: Admin');
  console.log('  Password: sandro');
  console.log('  ID:', admin.id);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
