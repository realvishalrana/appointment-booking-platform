import bcrypt from "bcryptjs";
import {
  AppointmentStatus,
  PrismaClient,
  RecurrenceFrequency,
  SeriesStatus,
} from "@prisma/client";
import { THERAPIST1_SCHEDULE, THERAPIST2_SCHEDULE } from "./schedules";

const prisma = new PrismaClient();

function daysFromNow(days: number, hour = 10, minute = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
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

  const patients = await Promise.all(
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

  const [patient1, patient2, patient3, patient4] = patients;

  for (const [therapistId, schedule] of [
    [therapist1.id, THERAPIST1_SCHEDULE],
    [therapist2.id, THERAPIST2_SCHEDULE],
  ] as const) {
    await prisma.therapistSchedule.deleteMany({ where: { therapistId } });
    await prisma.therapistSchedule.createMany({
      data: schedule.map((s) => ({ therapistId, ...s })),
    });
  }

  await prisma.appointment.deleteMany({});
  await prisma.recurringSeries.deleteMany({});
  await prisma.slotHold.deleteMany({});
  await prisma.idempotencyKey.deleteMany({});

  const pastStart = daysFromNow(-7, 10, 0);
  const pastEnd = addMinutes(pastStart, 30);

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient1.id,
        therapistId: therapist1.id,
        startAt: pastStart,
        endAt: pastEnd,
        status: AppointmentStatus.completed,
      },
      {
        patientId: patient2.id,
        therapistId: therapist1.id,
        startAt: daysFromNow(-3, 13, 30),
        endAt: daysFromNow(-3, 14, 0),
        status: AppointmentStatus.no_show,
        noShowNotes: "Patient did not join video call",
      },
      {
        patientId: patient3.id,
        therapistId: therapist2.id,
        startAt: daysFromNow(-5, 9, 0),
        endAt: daysFromNow(-5, 9, 45),
        status: AppointmentStatus.completed,
      },
      {
        patientId: patient1.id,
        therapistId: therapist1.id,
        startAt: daysFromNow(3, 10, 0),
        endAt: daysFromNow(3, 10, 30),
        status: AppointmentStatus.scheduled,
      },
      {
        patientId: patient2.id,
        therapistId: therapist1.id,
        startAt: daysFromNow(5, 14, 30),
        endAt: daysFromNow(5, 15, 0),
        status: AppointmentStatus.scheduled,
      },
      {
        patientId: patient4.id,
        therapistId: therapist2.id,
        startAt: daysFromNow(4, 11, 0),
        endAt: daysFromNow(4, 11, 45),
        status: AppointmentStatus.scheduled,
      },
      {
        patientId: patient2.id,
        therapistId: therapist1.id,
        startAt: new Date(Date.now() - 5 * 60_000),
        endAt: new Date(Date.now() + 25 * 60_000),
        status: AppointmentStatus.scheduled,
      },
    ],
  });

  const weeklyStart = daysFromNow(7, 15, 30);
  const weeklyEnd = daysFromNow(7, 16, 30);

  const activeSeries = await prisma.recurringSeries.create({
    data: {
      patientId: patient1.id,
      therapistId: therapist1.id,
      frequency: RecurrenceFrequency.weekly,
      startAt: weeklyStart,
      endAt: weeklyEnd,
      status: SeriesStatus.active,
    },
  });

  for (let i = 0; i < 4; i++) {
    const start = new Date(weeklyStart);
    start.setUTCDate(start.getUTCDate() + i * 7);
    const end = new Date(weeklyEnd);
    end.setUTCDate(end.getUTCDate() + i * 7);
    await prisma.appointment.create({
      data: {
        patientId: patient1.id,
        therapistId: therapist1.id,
        seriesId: activeSeries.id,
        startAt: start,
        endAt: end,
        status: AppointmentStatus.scheduled,
      },
    });
  }

  const cancelledSeries = await prisma.recurringSeries.create({
    data: {
      patientId: patient3.id,
      therapistId: therapist1.id,
      frequency: RecurrenceFrequency.biweekly,
      startAt: daysFromNow(-14, 10, 0),
      endAt: daysFromNow(-14, 10, 30),
      status: SeriesStatus.cancelled,
      cancellationReason: "Patient moved out of town",
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient3.id,
      therapistId: therapist1.id,
      seriesId: cancelledSeries.id,
      startAt: daysFromNow(-14, 10, 0),
      endAt: daysFromNow(-14, 10, 30),
      status: AppointmentStatus.cancelled,
      cancellationReason: "Patient moved out of town",
    },
  });

  console.log("Seed completed:");
  console.log("  Therapists: therapist@demo.com, therapist2@demo.com / password123");
  console.log("  Patients:   patient@demo.com, patient2@demo.com, patient3@demo.com, patient4@demo.com / password123");
}
