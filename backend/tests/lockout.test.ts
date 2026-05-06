import { describe, it, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { runMigrations } from "../src/db/migrate";
import { isLocked, recordLoginFailure, resetFailures } from "../src/auth/lockout";

let db: Database;
beforeEach(() => {
  db = new Database(":memory:");
  runMigrations(db);
  db.run(
    "INSERT INTO users (id, email, password_hash, display_name, specialization, created_at) VALUES (?,?,?,?,?,?)",
    ["u-1", "a@b.pl", "x", "A", "elektryk", Date.now()],
  );
});

describe("lockout", () => {
  it("first 4 failures do not lock the account", () => {
    for (let i = 0; i < 4; i++) recordLoginFailure(db, "u-1");
    expect(isLocked(db, "u-1")).toBe(false);
  });

  it("5th failure locks the account", () => {
    for (let i = 0; i < 5; i++) recordLoginFailure(db, "u-1");
    expect(isLocked(db, "u-1")).toBe(true);
  });

  it("resetFailures clears counter and lockedUntil", () => {
    for (let i = 0; i < 5; i++) recordLoginFailure(db, "u-1");
    resetFailures(db, "u-1");
    expect(isLocked(db, "u-1")).toBe(false);
    const row = db
      .query<{ failed_login_count: number; locked_until: number | null }, [string]>(
        "SELECT failed_login_count, locked_until FROM users WHERE id = ?",
      )
      .get("u-1");
    expect(row?.failed_login_count).toBe(0);
    expect(row?.locked_until).toBeNull();
  });
});
