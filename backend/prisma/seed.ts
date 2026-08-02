import { PrismaClient } from "@prisma/client";
import { seed } from "./seed/index";

const prisma = new PrismaClient();

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
