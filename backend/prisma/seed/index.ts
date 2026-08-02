import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { THERAPIST1_SCHEDULE, THERAPIST2_SCHEDULE } from "./schedules";

const prisma = new PrismaClient();

/** Remove all bookings, holds, and related transactional data. Keeps users and schedules. */
export async function clearBookingData() {
  await prisma.appointment.deleteMany({});
  await prisma.recurringSeries.deleteMany({});
  await prisma.slotHold.deleteMany({});
  await prisma.idempotencyKey.deleteMany({});
}

export async function seed() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const therapist1 = await prisma.user.upsert({
    where: { email: "therapist@demo.com" },
    update: {},
    create: {
      email: "therapist@demo.com",
      passwordHash,
      role: "therapist",
      name: "Dr. Sarah Johnson",
    },
  });

  const therapist2 = await prisma.user.upsert({
    where: { email: "therapist2@demo.com" },
    update: {},
    create: {
      email: "therapist2@demo.com",
      passwordHash,
      role: "therapist",
      name: "Dr. Michael Chen",
    },
  });

  await Promise.all(
    [
      { email: "patient@demo.com", name: "John Doe" },
      { email: "patient2@demo.com", name: "Jane Smith" },
      { email: "patient3@demo.com", name: "Alex Rivera" },
      { email: "patient4@demo.com", name: "Sam Wilson" },
    ].map((p) =>
      prisma.user.upsert({
        where: { email: p.email },
        update: {},
        create: { ...p, passwordHash, role: "patient" },
      })
    )
  );

  for (const [therapistId, schedule] of [
    [therapist1.id, THERAPIST1_SCHEDULE],
    [therapist2.id, THERAPIST2_SCHEDULE],
  ] as const) {
    await prisma.therapistSchedule.deleteMany({ where: { therapistId } });
    await prisma.therapistSchedule.createMany({
      data: schedule.map((s) => ({ therapistId, ...s })),
    });
  }

  await clearBookingData();

  console.log("Seed completed (users + schedules only, no demo appointments):");
  console.log("  Therapists: therapist@demo.com, therapist2@demo.com / password123");
  console.log(
    "  Patients:   patient@demo.com, patient2@demo.com, patient3@demo.com, patient4@demo.com / password123"
  );
}
