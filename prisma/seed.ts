import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@madrasah.test' },
    update: {},
    create: {
      email: 'admin@madrasah.test',
      fullName: 'Super Admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'guru@madrasah.test' },
    update: {},
    create: {
      email: 'guru@madrasah.test',
      fullName: 'Guru Demo',
      passwordHash,
      role: Role.GURU,
    },
  });

  await prisma.user.upsert({
    where: { email: 'pengawas@madrasah.test' },
    update: {},
    create: {
      email: 'pengawas@madrasah.test',
      fullName: 'Pengawas Demo',
      passwordHash,
      role: Role.PENGAWAS,
    },
  });

  const kelas = await prisma.class.upsert({
    where: { name_academicYear: { name: 'X-A', academicYear: '2025/2026' } },
    update: {},
    create: { name: 'X-A', academicYear: '2025/2026' },
  });

  await prisma.user.upsert({
    where: { nis: '20250001' },
    update: {},
    create: {
      nis: '20250001',
      fullName: 'Santri Demo',
      passwordHash,
      role: Role.SANTRI,
      classId: kelas.id,
    },
  });

  console.log('Seed selesai. Password default: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
