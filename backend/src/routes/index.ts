import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authController } from "../controllers/auth.controller";
import { bookingController, seriesController } from "../controllers/booking.controller";
import { holdController } from "../controllers/hold.controller";
import {
  therapistController,
  therapistPortalController,
} from "../controllers/therapist.controller";
import { authenticate, requireRole } from "../middleware/auth";
import {
  authRateLimit,
  bookingRateLimit,
  holdRateLimit,
} from "../middleware/rateLimit";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  bookingSchema,
  cancelReasonSchema,
  holdSchema,
  loginSchema,
  scheduleSchema,
  slotsQuerySchema,
  statusSchema,
} from "../validators";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth
router.post(
  "/auth/login",
  authRateLimit,
  validateBody(loginSchema),
  authController.login
);
router.get("/auth/me", authenticate, authController.me);

// Therapists & slots
router.get("/therapists", authenticate, therapistController.list);
router.get(
  "/therapists/:id/slots",
  authenticate,
  requireRole(UserRole.patient),
  validateQuery(slotsQuerySchema),
  therapistController.getSlots
);

// Holds
router.post(
  "/holds",
  authenticate,
  requireRole(UserRole.patient),
  holdRateLimit,
  validateBody(holdSchema),
  holdController.create
);
router.get(
  "/holds/me",
  authenticate,
  requireRole(UserRole.patient),
  holdController.getMine
);
router.delete(
  "/holds/me",
  authenticate,
  requireRole(UserRole.patient),
  holdController.release
);

// Bookings
router.post(
  "/bookings",
  authenticate,
  requireRole(UserRole.patient),
  bookingRateLimit,
  validateBody(bookingSchema),
  bookingController.confirm
);
router.get(
  "/bookings/me",
  authenticate,
  requireRole(UserRole.patient),
  bookingController.getMine
);
router.delete(
  "/bookings/:id",
  authenticate,
  requireRole(UserRole.patient),
  validateBody(cancelReasonSchema),
  bookingController.cancel
);

// Series
router.get(
  "/series/me",
  authenticate,
  requireRole(UserRole.patient),
  seriesController.getMine
);
router.delete(
  "/series/:id",
  authenticate,
  requireRole(UserRole.patient),
  validateBody(cancelReasonSchema),
  seriesController.cancel
);

// Therapist portal
router.get(
  "/therapist/appointments",
  authenticate,
  requireRole(UserRole.therapist),
  therapistPortalController.getAppointments
);
router.patch(
  "/therapist/appointments/:id/status",
  authenticate,
  requireRole(UserRole.therapist),
  validateBody(statusSchema),
  therapistPortalController.updateStatus
);
router.get(
  "/therapist/schedule",
  authenticate,
  requireRole(UserRole.therapist),
  therapistPortalController.getSchedule
);
router.put(
  "/therapist/schedule",
  authenticate,
  requireRole(UserRole.therapist),
  validateBody(scheduleSchema),
  therapistPortalController.updateSchedule
);

export default router;
