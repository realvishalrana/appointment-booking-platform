import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  timezone: process.env.APP_TIMEZONE || "Asia/Kolkata",
  holdDurationMs: 60_000,
  recurringHorizonMonths: 6,
  /** Hours after appointment end when therapist may still record status once */
  statusUpdateGraceHours: parseInt(
    process.env.STATUS_UPDATE_GRACE_HOURS || "24",
    10
  ),
};
