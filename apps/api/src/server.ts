import app from "./app";
import { env } from "@hazjak/config";
import { runBookingLifecycleJobs } from "./utils/booking-lifecycle";

const LIFECYCLE_INTERVAL_MS = 60_000;

app.listen(env.apiPort, () => {
  console.info(`Hazjak API running on http://localhost:${env.apiPort}`);
  setInterval(() => {
    runBookingLifecycleJobs().catch((err) =>
      console.error("[bookings] lifecycle job failed:", err)
    );
  }, LIFECYCLE_INTERVAL_MS);
});
