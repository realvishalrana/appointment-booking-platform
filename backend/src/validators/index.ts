import { z } from "zod";

const reasonField = z.string().trim().min(3).max(500);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const holdSchema = z.object({
  therapistId: z.number().int().positive(),
  startAt: z.string(),
  endAt: z.string(),
});

export const bookingSchema = z.object({
  type: z.enum(["one_time", "recurring"]),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
});

export const cancelReasonSchema = z.object({
  reason: reasonField,
});

export const statusSchema = z
  .object({
    status: z.enum(["scheduled", "completed", "no_show", "cancelled"]),
    cancellationReason: z.string().trim().max(500).optional(),
    noShowNotes: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "cancelled" && !data.cancellationReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cancellation reason is required",
        path: ["cancellationReason"],
      });
    }
    if (
      data.cancellationReason &&
      data.cancellationReason.trim().length < 3
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cancellation reason must be at least 3 characters",
        path: ["cancellationReason"],
      });
    }
  });

export const scheduleSchema = z.object({
  windows: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
      })
    )
    .min(1),
});

export const slotsQuerySchema = z.object({
  from: z.string(),
  to: z.string(),
});
