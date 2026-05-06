import { Hono } from "hono";
import { health } from "./routes/health";
import { auth } from "./routes/auth";
import { runMigrations } from "./db/migrate";
import { config } from "./config";

const app = new Hono();
app.route("/health", health);
app.route("/auth", auth);

runMigrations();

console.log(`Backend listening on http://localhost:${config.PORT}`);
export default { port: config.PORT, fetch: app.fetch };
