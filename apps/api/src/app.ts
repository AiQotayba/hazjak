import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { API_PREFIX } from "@hazjak/constants";
import { env, isCorsOriginAllowed } from "@hazjak/config";

import authRoutes from "./modules/auth/auth.routes";
import stadiumRoutes from "./modules/stadiums/stadiums.routes";
import bookingRoutes from "./modules/bookings/bookings.routes";
import reviewRoutes from "./modules/reviews/reviews.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import availabilityRoutes from "./modules/availability/availability.routes";
import userRoutes from "./modules/users/users.routes";
import settingsRoutes from "./modules/settings/settings.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import { UPLOADS_ROOT } from "./utils/uploads-path";

const app = express();

if (env.trustProxy !== false) {
  app.set("trust proxy", env.trustProxy);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use("/uploads", express.static(UPLOADS_ROOT));
/** Origins مضمّنة — تُدمج مع CORS_ORIGIN / CORS_ALLOWED_ORIGINS / WEB_URL / ADMIN_URL */
const BUILTIN_CORS_ORIGINS = [
  "https://hazjak.vercel.app",
  "https://beeplay.vercel.app",
  "https://admin-hazjak.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
] as const;

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        isCorsOriginAllowed(origin) ||
        BUILTIN_CORS_ORIGINS.includes(origin as (typeof BUILTIN_CORS_ORIGINS)[number])
      ) {
        callback(null, true);
        return;
      }

      if (env.nodeEnv !== "production") {
        console.warn(
          `[cors] blocked origin: ${origin} (allowed: ${[...env.corsOrigins, ...BUILTIN_CORS_ORIGINS].join(", ")})`,
        );
      }

      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: "طلبات كثيرة، حاول لاحقاً" },
  })
);

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Hazjak API", data: { status: "ok" } });
});

const api = express.Router();
api.use("/auth", authRoutes);
api.use("/stadiums", stadiumRoutes);
api.use("/bookings", bookingRoutes);
api.use("/reviews", reviewRoutes);
api.use("/notifications", notificationRoutes);
api.use("/analytics", analyticsRoutes);
api.use("/availability", availabilityRoutes);
api.use("/users", userRoutes);
api.use("/settings", settingsRoutes);
api.use("/upload", uploadRoutes);

app.use(API_PREFIX, api);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "المسار غير موجود" });
});

export default app;
