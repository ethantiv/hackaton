import type { Database } from "bun:sqlite";
import { config } from "../config";

export function isLocked(db: Database, userId: string): boolean {
  const row = db
    .query<{ locked_until: number | null }, [string]>(
      "SELECT locked_until FROM users WHERE id = ?",
    )
    .get(userId);
  if (!row || row.locked_until === null) return false;
  return row.locked_until > Date.now();
}

export function lockedUntil(db: Database, userId: string): number | null {
  const row = db
    .query<{ locked_until: number | null }, [string]>(
      "SELECT locked_until FROM users WHERE id = ?",
    )
    .get(userId);
  return row?.locked_until ?? null;
}

export function recordLoginFailure(db: Database, userId: string): void {
  const row = db
    .query<{ failed_login_count: number }, [string]>(
      "SELECT failed_login_count FROM users WHERE id = ?",
    )
    .get(userId);
  const next = (row?.failed_login_count ?? 0) + 1;
  if (next >= config.LOGIN_LOCKOUT_FAILS) {
    const lockUntil = Date.now() + config.LOGIN_LOCKOUT_MINUTES * 60_000;
    db.run("UPDATE users SET failed_login_count = ?, locked_until = ? WHERE id = ?", [
      next,
      lockUntil,
      userId,
    ]);
  } else {
    db.run("UPDATE users SET failed_login_count = ? WHERE id = ?", [next, userId]);
  }
}

export function resetFailures(db: Database, userId: string): void {
  db.run(
    "UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = ?",
    [userId],
  );
}
