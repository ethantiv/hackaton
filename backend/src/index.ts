import { Hono } from "hono";
import { health } from "./routes/health";

const app = new Hono();
app.route("/health", health);

const port = Number(process.env.PORT ?? 3000);
console.log(`Backend listening on http://localhost:${port}`);

export default { port, fetch: app.fetch };
