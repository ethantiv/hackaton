import { Hono } from "hono";
import { health } from "./routes/health";
import { auth } from "./routes/auth";
import { me } from "./routes/me";
import { runMigrations } from "./db/migrate";
import { config } from "./config";

const app = new Hono();
app.route("/health", health);
app.route("/auth", auth);
app.route("/me", me);

runMigrations();

console.log(`Backend listening on http://localhost:${config.PORT}`);
export default { port: config.PORT, fetch: app.fetch };
