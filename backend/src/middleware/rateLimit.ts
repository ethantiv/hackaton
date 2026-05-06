import type { MiddlewareHandler } from "hono";

type Bucket = { count: number; resetAt: number };

export function loginRateLimit(opts: { max: number; windowMs: number }): MiddlewareHandler {
  const buckets = new Map<string, Bucket>();
  return async (c, next) => {
    const ip =
      c.req.header("X-Forwarded-For")?.split(",")[0].trim() ??
      c.req.header("X-Real-IP") ??
      "unknown";
    const now = Date.now();
    const b = buckets.get(ip);
    if (!b || b.resetAt < now) {
      buckets.set(ip, { count: 1, resetAt: now + opts.windowMs });
    } else {
      b.count += 1;
      if (b.count > opts.max) {
        const retryAfter = Math.ceil((b.resetAt - now) / 1000);
        c.header("Retry-After", String(retryAfter));
        return c.json({ error: "rate_limited" }, 429);
      }
    }
    await next();
  };
}
