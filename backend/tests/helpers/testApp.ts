import { Hono } from "hono";
import { health } from "../../src/routes/health";

export function buildApp() {
  const app = new Hono();
  app.route("/health", health);
  return app;
}
