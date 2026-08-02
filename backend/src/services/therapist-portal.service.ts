import { AppointmentStatus } from "@prisma/client";
import { TherapistError } from "../errors/AppError";
import { appointmentRepository } from "../repositories/appointment.repository";
import { scheduleRepository, ScheduleWindowInput } from "../repositories/schedule.repository";
import { validateScheduleWindows } from "../utils/scheduleValidation";
import { isWithinWindow } from "../utils/time";

export const therapistPortalService = {
  getAppointments(therapistId: number) {
    return appointmentRepository.findByTherapistId(therapistId);
  },

  async updateAppointmentStatus(
    therapistId: number,
    appointmentId: number,
    status: AppointmentStatus,
    options?: { cancellationReason?: string; noShowNotes?: string }
  ) {
    const appointment = await appointmentRepository.findById(appointmentId);

    if (!appointment || appointment.therapistId !== therapistId) {
      throw new TherapistError("Appointment not found", 404);
    }

    const now = new Date();
    if (!isWithinWindow(now, appointment.startAt, appointment.endAt)) {
      throw new TherapistError(
        "Status can only be updated during the appointment window",
        403
      );
    }

    if (appointment.status !== AppointmentStatus.scheduled) {
      throw new TherapistError("Status has already been recorded", 409);
    }

    const extra: { cancellationReason?: string; noShowNotes?: string } = {};
    if (status === AppointmentStatus.cancelled && options?.cancellationReason) {
      extra.cancellationReason = options.cancellationReason;
    }
    if (status === AppointmentStatus.no_show && options?.noShowNotes) {
      extra.noShowNotes = options.noShowNotes;
    }

    return appointmentRepository.updateStatus(appointmentId, status, extra);
  },

  getSchedule(therapistId: number) {
    return scheduleRepository.findByTherapistId(therapistId);
  },

  async updateSchedule(therapistId: number, windows: ScheduleWindowInput[]) {
    const validationError = validateScheduleWindows(windows);
    if (validationError) {
      throw new TherapistError(validationError);
    }

    return scheduleRepository.replaceForTherapist(therapistId, windows);
  },
};
