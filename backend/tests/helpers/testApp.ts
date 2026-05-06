import { Hono } from "hono";
import { Database } from "bun:sqlite";
import { runMigrations } from "../../src/db/migrate";
import { setDbForTests } from "../../src/db/client";
import { seed } from "../../src/db/seed";
import { health } from "../../src/routes/health";
import { auth } from "../../src/routes/auth";
import { me } from "../../src/routes/me";
import { jobs } from "../../src/routes/jobs";
import { jobPhotos, photoFiles } from "../../src/routes/photos";
import { secureHeaders } from "../../src/middleware/secureHeaders";
import { loginRateLimit } from "../../src/middleware/rateLimit";
import { errorHandler } from "../../src/middleware/errorHandler";

export async function buildApp() {
  const db = new Database(":memory:");
  runMigrations(db);
  setDbForTests(db);
  await seed(db);
  const app = new Hono();
  app.use("*", secureHeaders());
  app.onError(errorHandler);
  app.use("/auth/login", loginRateLimit({ max: 10, windowMs: 15 * 60_000 }));
  app.route("/health", health);
  app.route("/auth", auth);
  app.route("/me", me);
  app.route("/jobs", jobs);
  app.route("/jobs", jobPhotos);
  app.route("/photos", photoFiles);
  return { app, db };
}
