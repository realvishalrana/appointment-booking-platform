import { UserRole } from "@prisma/client";
import { prisma } from "../prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, name: true },
    });
  },

  findTherapists() {
    return prisma.user.findMany({
      where: { role: UserRole.therapist },
      select: { id: true, name: true, email: true },
    });
  },

  findTherapistById(id: number) {
    return prisma.user.findFirst({
      where: { id, role: UserRole.therapist },
    });
  },
};
