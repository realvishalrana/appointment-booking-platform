import { prisma } from "../prisma";

export const idempotencyRepository = {
  findByKey(key: string) {
    return prisma.idempotencyKey.findUnique({ where: { key } });
  },

  create(data: {
    key: string;
    userId: number;
    requestHash: string;
    responseBody: object;
  }) {
    return prisma.idempotencyKey.create({ data });
  },
};
