import { config } from "../config";
import { HoldError } from "../errors/AppError";
import { holdRepository } from "../repositories/hold.repository";

export const holdService = {
  async createHold(
    patientId: number,
    therapistId: number,
    startAt: Date,
    endAt: Date
  ) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.holdDurationMs);

    const result = await holdRepository.createInTransaction(
      therapistId,
      patientId,
      startAt,
      endAt,
      expiresAt
    );

    if ("error" in result) {
      throw new HoldError("Slot is already held by another patient");
    }

    return result.hold;
  },

  getActiveHold(patientId: number) {
    return holdRepository.findActiveByPatientId(patientId);
  },

  getValidHold(patientId: number) {
    return holdRepository.findValidByPatientId(patientId);
  },

  releaseHold(patientId: number) {
    return holdRepository.deleteByPatientId(patientId);
  },
};
