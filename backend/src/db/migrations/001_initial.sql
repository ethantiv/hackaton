CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  specialization      TEXT NOT NULL,
  failed_login_count  INTEGER NOT NULL DEFAULT 0,
  locked_until        INTEGER,
  created_at          INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  TEXT NOT NULL,
  expires_at  INTEGER NOT NULL,
  revoked_at  INTEGER,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id                       TEXT PRIMARY KEY,
  ticket_id                TEXT UNIQUE NOT NULL,
  technician_id            TEXT NOT NULL REFERENCES users(id),
  category                 TEXT NOT NULL,
  address                  TEXT NOT NULL,
  unit                     TEXT,
  district                 TEXT,
  description              TEXT NOT NULL,
  scheduled_window         TEXT NOT NULL,
  scheduled_start          TEXT NOT NULL,
  estimated_duration_min   INTEGER NOT NULL,
  status                   TEXT NOT NULL CHECK(status IN ('pending','in_progress','done')),
  priority                 TEXT NOT NULL CHECK(priority IN ('normal','urgent')),
  contact_name             TEXT,
  contact_phone            TEXT,
  travel_time_min          INTEGER,
  is_new                   INTEGER NOT NULL DEFAULT 0,
  created_at               INTEGER NOT NULL,
  updated_at               INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id           TEXT PRIMARY KEY,
  job_id       TEXT NOT NULL REFERENCES jobs(id),
  description  TEXT NOT NULL,
  filename     TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL,
  taken_at     INTEGER NOT NULL,
  uploaded_by  TEXT NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_technician_status ON jobs(technician_id, status);
CREATE INDEX IF NOT EXISTS idx_refresh_user            ON refresh_tokens(user_id);
