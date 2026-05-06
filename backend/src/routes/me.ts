import { Hono } from "hono";
import { getDb } from "../db/client";
import { requireAuth, type AuthVars } from "../auth/middleware";

export const me = new Hono<{ Variables: AuthVars }>();

me.get("/", requireAuth(), (c) => {
  const id = c.get("userId");
  const row = getDb()
    .query<
      { id: string; email: string; display_name: string; specialization: string },
      [string]
    >("SELECT id, email, display_name, specialization FROM users WHERE id = ?")
    .get(id);
  if (!row) return c.json({ error: "unauthorized" }, 401);
  return c.json({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    specialization: row.specialization,
  });
});
