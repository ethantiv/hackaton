import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "bun:sqlite";
import { getDb } from "./client";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "migrations");

export function runMigrations(db: Database = getDb()): number {
  db.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  const row = db.query<{ value: string }, []>("SELECT value FROM meta WHERE key = 'schema_version'").get();
  const current = row ? Number(row.value) : 0;

  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  let applied = current;
  for (const file of files) {
    const version = Number(file.split("_")[0]);
    if (version <= current) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.run(
        "INSERT INTO meta(key, value) VALUES('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [String(version)],
      );
      db.exec("COMMIT");
      applied = version;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  return applied;
}

if (import.meta.main) {
  const v = runMigrations();
  console.log(`Schema is at version ${v}`);
}
