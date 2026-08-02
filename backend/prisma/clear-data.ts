import { PrismaClient } from "@prisma/client";
import { clearBookingData } from "./seed/index";

const prisma = new PrismaClient();

clearBookingData()
  .then(() => {
    console.log(
      "Cleared: appointments, recurring series, slot holds, idempotency keys."
    );
    console.log("Users and therapist schedules were not changed.");
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());
