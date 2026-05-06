import { Hono } from "hono";
import { getDb } from "../db/client";
import { LoginBody, RefreshBody } from "../schemas/auth";
import { verifyPassword, DUMMY_HASH } from "../auth/passwords";
import { signAccessToken } from "../auth/jwt";
import {
  isLocked, lockedUntil, recordLoginFailure, resetFailures,
} from "../auth/lockout";
import {
  issueRefreshToken, rotateRefreshToken, revokeByToken,
} from "../auth/refreshTokens";
import { requireAuth, type AuthVars } from "../auth/middleware";

export const auth = new Hono<{ Variables: AuthVars }>();

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  specialization: string;
};

auth.post("/login", async (c) => {
  const parsed = LoginBody.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "invalid_request" }, 400);

  const db = getDb();
  const user = db
    .query<UserRow, [string]>(
      "SELECT id, email, password_hash, display_name, specialization FROM users WHERE email = ?",
    )
    .get(parsed.data.email);

  if (user && isLocked(db, user.id)) {
    return c.json({ error: "account_locked", lockedUntil: lockedUntil(db, user.id) }, 423);
  }

  const ok = await verifyPassword(user?.password_hash ?? DUMMY_HASH, parsed.data.password);
  if (!user || !ok) {
    if (user) recordLoginFailure(db, user.id);
    return c.json({ error: "invalid_credentials" }, 401);
  }

  resetFailures(db, user.id);
  const accessToken = await signAccessToken({ sub: user.id, email: user.email });
  const refresh = issueRefreshToken(db, user.id);
  return c.json({
    accessToken,
    refreshToken: refresh.token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      specialization: user.specialization,
    },
  });
});

auth.post("/refresh", async (c) => {
  const parsed = RefreshBody.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "invalid_request" }, 400);
  const db = getDb();
  const result = rotateRefreshToken(db, parsed.data.refreshToken);
  if (result.kind !== "ok") return c.json({ error: "invalid_token" }, 401);

  const user = db
    .query<{ email: string }, [string]>("SELECT email FROM users WHERE id = ?")
    .get(result.userId);
  if (!user) return c.json({ error: "invalid_token" }, 401);

  const accessToken = await signAccessToken({ sub: result.userId, email: user.email });
  return c.json({ accessToken, refreshToken: result.token });
});

auth.post("/logout", requireAuth(), async (c) => {
  const db = getDb();
  const body = await c.req.json().catch(() => ({}));
  const token = (body as { refreshToken?: string }).refreshToken;
  if (token) revokeByToken(db, token);
  return c.body(null, 204);
});
