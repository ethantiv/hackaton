import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "../config";

let _db: Database | null = null;

export function getDb(): Database {
  if (_db) return _db;
  mkdirSync(dirname(config.DATABASE_PATH), { recursive: true });
  _db = new Database(config.DATABASE_PATH, { create: true });
  _db.exec("PRAGMA journal_mode = WAL;");
  _db.exec("PRAGMA foreign_keys = ON;");
  return _db;
}

export function setDbForTests(db: Database) {
  _db = db;
}
