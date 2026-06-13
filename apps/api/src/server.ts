import app from "./app";
import { env } from "@hazjak/config";

app.listen(env.apiPort, () => {
  console.log(`Hazjak API running on http://localhost:${env.apiPort}`);
});
