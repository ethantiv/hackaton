import { describe, it, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { runMigrations } from "../src/db/migrate";
import { seed } from "../src/db/seed";

describe("seed", () => {
  it("creates 4 technicians with correct emails", async () => {
    const db = new Database(":memory:");
    runMigrations(db);
    await seed(db);
    const emails = db
      .query<{ email: string }, []>("SELECT email FROM users ORDER BY email")
      .all()
      .map((r) => r.email);
    expect(emails).toEqual([
      "anna@firma.pl",
      "kasia@firma.pl",
      "marek@firma.pl",
      "piotr@firma.pl",
    ]);
  });

  it("Marek has 8 jobs (3 done, 5 pending)", async () => {
    const db = new Database(":memory:");
    runMigrations(db);
    await seed(db);
    const u = db.query<{ id: string }, []>("SELECT id FROM users WHERE email = 'marek@firma.pl'").get()!;
    const jobs = db
      .query<{ status: string }, [string]>("SELECT status FROM jobs WHERE technician_id = ?")
      .all(u.id);
    expect(jobs.length).toBe(8);
    expect(jobs.filter((j) => j.status === "done").length).toBe(3);
    expect(jobs.filter((j) => j.status === "pending").length).toBe(5);
  });

  it("Kasia has 8 jobs all done (empty-state scenario)", async () => {
    const db = new Database(":memory:");
    runMigrations(db);
    await seed(db);
    const u = db.query<{ id: string }, []>("SELECT id FROM users WHERE email = 'kasia@firma.pl'").get()!;
    const jobs = db
      .query<{ status: string }, [string]>("SELECT status FROM jobs WHERE technician_id = ?")
      .all(u.id);
    expect(jobs.length).toBe(8);
    expect(jobs.every((j) => j.status === "done")).toBe(true);
  });

  it("Piotr has a job with is_new = 1 (new-job scenario)", async () => {
    const db = new Database(":memory:");
    runMigrations(db);
    await seed(db);
    const u = db.query<{ id: string }, []>("SELECT id FROM users WHERE email = 'piotr@firma.pl'").get()!;
    const news = db
      .query<{ c: number }, [string]>("SELECT COUNT(*) AS c FROM jobs WHERE technician_id = ? AND is_new = 1")
      .get(u.id);
    expect(news?.c).toBe(1);
  });

  it("seed is idempotent — running twice does not duplicate users", async () => {
    const db = new Database(":memory:");
    runMigrations(db);
    await seed(db);
    await seed(db);
    const c = db.query<{ c: number }, []>("SELECT COUNT(*) AS c FROM users").get();
    expect(c?.c).toBe(4);
  });
});
