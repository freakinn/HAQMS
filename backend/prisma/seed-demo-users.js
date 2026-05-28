const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@haqms.com',
      name: 'System Administrator',
      role: 'ADMIN',
    },
    {
      email: 'reception1@haqms.com',
      name: 'Sarah Connor',
      role: 'RECEPTIONIST',
    },
    {
      email: 'doctor1@haqms.com',
      name: 'Dr. Gregory House',
      role: 'DOCTOR',
      doctor: {
        name: 'Dr. Gregory House',
        specialization: 'Diagnostics',
        department: 'Internal Medicine',
        consultationFee: 250,
        experience: 20,
      },
    },
  ];

  for (const userData of users) {
    const { doctor, ...userFields } = userData;
    const user = await prisma.user.upsert({
      where: { email: userFields.email },
      update: {
        password: hashedPassword,
        name: userFields.name,
        role: userFields.role,
      },
      create: {
        ...userFields,
        password: hashedPassword,
      },
    });

    if (doctor) {
      await prisma.doctor.upsert({
        where: { userId: user.id },
        update: doctor,
        create: {
          ...doctor,
          userId: user.id,
        },
      });
    }
  }

  console.log('Demo users are ready. Password for all demo accounts: password123');
}

main()
  .catch((error) => {
    console.error('Demo user seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
