import type { MiddlewareHandler } from "hono";
import { verifyAccessToken } from "./jwt";
import { getDb } from "../db/client";

export type AuthVars = {
  userId: string;
  email: string;
};

export function requireAuth(): MiddlewareHandler<{ Variables: AuthVars }> {
  return async (c, next) => {
    const header = c.req.header("Authorization") ?? "";
    const m = header.match(/^Bearer (.+)$/);
    if (!m) return c.json({ error: "unauthorized" }, 401);
    try {
      const claims = await verifyAccessToken(m[1]);
      const exists = getDb()
        .query<{ id: string }, [string]>("SELECT id FROM users WHERE id = ?")
        .get(claims.sub);
      if (!exists) return c.json({ error: "unauthorized" }, 401);
      c.set("userId", claims.sub);
      c.set("email", claims.email);
      await next();
    } catch {
      return c.json({ error: "unauthorized" }, 401);
    }
  };
}
