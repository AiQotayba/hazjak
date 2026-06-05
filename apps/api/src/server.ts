import app from "./app";
import { env } from "@beeplay/config";

app.listen(env.apiPort, () => {
  console.log(`BeePlay API running on http://localhost:${env.apiPort}`);
});
