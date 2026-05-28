const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const password = 'password123';

async function upsertPatient(data) {
  const existing = await prisma.patient.findFirst({
    where: { phoneNumber: data.phoneNumber },
  });

  if (existing) {
    return prisma.patient.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.patient.create({ data });
}

async function upsertStandaloneDoctor(data) {
  const existing = await prisma.doctor.findFirst({
    where: { name: data.name },
  });

  if (existing) {
    return prisma.doctor.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.doctor.create({ data });
}

async function upsertQueueToken(data) {
  const existing = await prisma.queueToken.findFirst({
    where: {
      tokenNumber: data.tokenNumber,
      patientId: data.patientId,
      doctorId: data.doctorId,
    },
  });

  if (existing) {
    return prisma.queueToken.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.queueToken.create({ data });
}

async function upsertAppointment(data) {
  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      appointmentDate: data.appointmentDate,
    },
  });

  if (existing) {
    return prisma.appointment.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.appointment.create({ data });
}

async function main() {
  console.log('Seeding full HAQMS demo data...');

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@haqms.com' },
    update: {
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@haqms.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'reception1@haqms.com' },
    update: {
      password: hashedPassword,
      name: 'Sarah Connor',
      role: 'RECEPTIONIST',
    },
    create: {
      email: 'reception1@haqms.com',
      password: hashedPassword,
      name: 'Sarah Connor',
      role: 'RECEPTIONIST',
    },
  });

  const doctorUser1 = await prisma.user.upsert({
    where: { email: 'doctor1@haqms.com' },
    update: {
      password: hashedPassword,
      name: 'Dr. Gregory House',
      role: 'DOCTOR',
    },
    create: {
      email: 'doctor1@haqms.com',
      password: hashedPassword,
      name: 'Dr. Gregory House',
      role: 'DOCTOR',
    },
  });

  const doctorUser2 = await prisma.user.upsert({
    where: { email: 'doctor2@haqms.com' },
    update: {
      password: hashedPassword,
      name: 'Dr. Meredith Grey',
      role: 'DOCTOR',
    },
    create: {
      email: 'doctor2@haqms.com',
      password: hashedPassword,
      name: 'Dr. Meredith Grey',
      role: 'DOCTOR',
    },
  });

  const doctorUser3 = await prisma.user.upsert({
    where: { email: 'doctor3@haqms.com' },
    update: {
      password: hashedPassword,
      name: 'Dr. John Carter',
      role: 'DOCTOR',
    },
    create: {
      email: 'doctor3@haqms.com',
      password: hashedPassword,
      name: 'Dr. John Carter',
      role: 'DOCTOR',
    },
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctorUser1.id },
    update: {
      name: 'Dr. Gregory House',
      specialization: 'Diagnostics',
      department: 'Internal Medicine',
      consultationFee: 250,
      experience: 20,
      availableFrom: '09:00',
      availableTo: '17:00',
    },
    create: {
      userId: doctorUser1.id,
      name: 'Dr. Gregory House',
      specialization: 'Diagnostics',
      department: 'Internal Medicine',
      consultationFee: 250,
      experience: 20,
      availableFrom: '09:00',
      availableTo: '17:00',
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctorUser2.id },
    update: {
      name: 'Dr. Meredith Grey',
      specialization: 'General Surgery',
      department: 'Surgery',
      consultationFee: 320,
      experience: 12,
      availableFrom: '08:00',
      availableTo: '16:00',
    },
    create: {
      userId: doctorUser2.id,
      name: 'Dr. Meredith Grey',
      specialization: 'General Surgery',
      department: 'Surgery',
      consultationFee: 320,
      experience: 12,
      availableFrom: '08:00',
      availableTo: '16:00',
    },
  });

  const doctor3 = await prisma.doctor.upsert({
    where: { userId: doctorUser3.id },
    update: {
      name: 'Dr. John Carter',
      specialization: 'Emergency Medicine',
      department: 'Emergency',
      consultationFee: 180,
      experience: 8,
      availableFrom: '10:00',
      availableTo: '18:00',
    },
    create: {
      userId: doctorUser3.id,
      name: 'Dr. John Carter',
      specialization: 'Emergency Medicine',
      department: 'Emergency',
      consultationFee: 180,
      experience: 8,
      availableFrom: '10:00',
      availableTo: '18:00',
    },
  });

  const doctor4 = await upsertStandaloneDoctor({
    name: 'Dr. Lisa Cuddy',
    specialization: 'Endocrinology',
    department: 'Internal Medicine',
    consultationFee: 210,
    experience: 15,
    availableFrom: '09:00',
    availableTo: '17:00',
  });

  await upsertStandaloneDoctor({
    name: 'Dr. Perry Cox',
    specialization: 'Cardiology',
    department: 'Cardiology',
    consultationFee: 290,
    experience: 18,
    availableFrom: '08:30',
    availableTo: '16:30',
  });

  const patients = await Promise.all([
    upsertPatient({
      name: 'Alice Johnson',
      email: 'alice.j@email.com',
      phoneNumber: '555-0101',
      age: 34,
      gender: 'Female',
      medicalHistory: 'Hypertension, managed with Lisinopril. Seasonal allergies. No known drug allergies.',
    }),
    upsertPatient({
      name: 'Robert Martinez',
      email: 'rob.m@email.com',
      phoneNumber: '555-0102',
      age: 52,
      gender: 'Male',
      medicalHistory: 'Type 2 Diabetes (on Metformin). History of mild angina. Non-smoker.',
    }),
    upsertPatient({
      name: 'Emily Davis',
      phoneNumber: '555-0103',
      age: 28,
      gender: 'Female',
      medicalHistory: 'Asthma (uses Salbutamol inhaler PRN). History of appendectomy (2019).',
    }),
    upsertPatient({
      name: 'Michael Thompson',
      email: 'michael.t@email.com',
      phoneNumber: '555-0104',
      age: 45,
      gender: 'Male',
      medicalHistory: 'Hypercholesterolemia on Atorvastatin. Former smoker. Mild sleep apnea.',
    }),
    upsertPatient({
      name: 'Sophia Williams',
      email: 'sophia.w@email.com',
      phoneNumber: '555-0105',
      age: 61,
      gender: 'Female',
      medicalHistory: 'Osteoarthritis in both knees. Post-menopause HRT. Glaucoma (controlled).',
    }),
    upsertPatient({
      name: 'James Anderson',
      phoneNumber: '555-0106',
      age: 39,
      gender: 'Male',
      medicalHistory: 'Anxiety disorder (on Sertraline). Eczema flare-ups. No surgical history.',
    }),
    upsertPatient({
      name: 'Bruce Wayne',
      email: 'bruce@wayneenterprises.com',
      phoneNumber: '555-0199',
      age: 35,
      gender: 'Male',
      medicalHistory: null,
    }),
    upsertPatient({
      name: 'Clark Kent',
      email: 'clark.kent@dailyplanet.com',
      phoneNumber: '555-0198',
      age: 32,
      gender: 'Male',
      medicalHistory: null,
    }),
    upsertPatient({
      name: 'Diana Prince',
      email: 'diana@themyscira.org',
      phoneNumber: '555-0197',
      age: 29,
      gender: 'Female',
      medicalHistory: null,
    }),
    upsertPatient({
      name: 'Peter Parker',
      phoneNumber: '555-0196',
      age: 23,
      gender: 'Male',
      medicalHistory: 'History of wrist fractures (bilateral). Heightened sensory response noted.',
    }),
  ]);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const makeDateTime = (base, hour, minute = 0) => {
    const date = new Date(base);
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const appointmentData = [
    [patients[0], doctor1, makeDateTime(today, 9), 'Routine diagnostic review', 'PENDING'],
    [patients[1], doctor1, makeDateTime(today, 10, 30), 'Follow-up on blood sugar management', 'PENDING'],
    [patients[2], doctor2, makeDateTime(today, 9, 30), 'Pre-surgical consultation', 'PENDING'],
    [patients[3], doctor2, makeDateTime(today, 11), 'Chest pain evaluation', 'COMPLETED'],
    [patients[6], doctor1, makeDateTime(today, 14), 'General check-up', 'PENDING'],
    [patients[7], doctor3, makeDateTime(today, 13), 'Annual physical', 'PENDING'],
    [patients[4], doctor1, makeDateTime(yesterday, 10), 'Knee pain assessment', 'COMPLETED'],
    [patients[5], doctor2, makeDateTime(yesterday, 14), 'Dermatological review', 'COMPLETED'],
    [patients[9], doctor3, makeDateTime(tomorrow, 10), 'Wrist pain and mobility assessment', 'PENDING'],
    [patients[8], doctor2, makeDateTime(tomorrow, 11, 30), 'Minor laceration suture removal', 'PENDING'],
    [patients[0], doctor3, makeDateTime(today, 15), 'Blood pressure monitoring', 'CANCELLED'],
  ];

  const appointments = [];
  for (const [patient, doctor, appointmentDate, reason, status] of appointmentData) {
    appointments.push(
      await upsertAppointment({
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate,
        reason,
        status,
      })
    );
  }

  await Promise.all([
    upsertQueueToken({
      tokenNumber: 1,
      patientId: patients[0].id,
      doctorId: doctor1.id,
      appointmentId: appointments[0].id,
      status: 'CALLING',
    }),
    upsertQueueToken({
      tokenNumber: 2,
      patientId: patients[1].id,
      doctorId: doctor1.id,
      appointmentId: appointments[1].id,
      status: 'WAITING',
    }),
    upsertQueueToken({
      tokenNumber: 3,
      patientId: patients[6].id,
      doctorId: doctor1.id,
      status: 'WAITING',
    }),
    upsertQueueToken({
      tokenNumber: 1,
      patientId: patients[2].id,
      doctorId: doctor2.id,
      appointmentId: appointments[2].id,
      status: 'CALLING',
    }),
    upsertQueueToken({
      tokenNumber: 2,
      patientId: patients[8].id,
      doctorId: doctor2.id,
      status: 'WAITING',
    }),
    upsertQueueToken({
      tokenNumber: 1,
      patientId: patients[7].id,
      doctorId: doctor3.id,
      appointmentId: appointments[5].id,
      status: 'WAITING',
    }),
    upsertQueueToken({
      tokenNumber: 1,
      patientId: patients[0].id,
      doctorId: doctor4.id,
      status: 'WAITING',
    }),
  ]);

  console.log('Full demo data is ready.');
  console.log(`Demo password: ${password}`);
  console.log(`Users ready: ${admin.email}, ${receptionist.email}, ${doctorUser1.email}`);
}

main()
  .catch((error) => {
    console.error('Full demo seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
