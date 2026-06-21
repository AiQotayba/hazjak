import app from "./app";
import { env } from "@hazjak/config";
import { expireStaleDepositBookings } from "./utils/booking-lifecycle";

const EXPIRE_INTERVAL_MS = 60_000;

app.listen(env.apiPort, () => {
  console.info(`Hazjak API running on http://localhost:${env.apiPort}`);
  setInterval(() => {
    expireStaleDepositBookings().catch((err) =>
      console.error("[bookings] expire job failed:", err)
    );
  }, EXPIRE_INTERVAL_MS);
});
