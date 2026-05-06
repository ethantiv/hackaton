import { Hono } from "hono";
import { health } from "./routes/health";
import { auth } from "./routes/auth";
import { me } from "./routes/me";
import { jobs } from "./routes/jobs";
import { jobPhotos, photoFiles } from "./routes/photos";
import { secureHeaders } from "./middleware/secureHeaders";
import { loginRateLimit } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";
import { runMigrations } from "./db/migrate";
import { config } from "./config";

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

runMigrations();

console.log(`Backend listening on http://localhost:${config.PORT}`);
export default { port: config.PORT, fetch: app.fetch };
