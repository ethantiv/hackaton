# Field Notebook Backend

Bun + Hono + SQLite backend for the Field Service Technician iOS app.

## Local development

```bash
cd backend
bun install
bun run migrate     # creates ./data/app.db with schema
bun run seed        # inserts 4 test technicians and their jobs
bun run dev         # http://localhost:3000
```

## Test accounts (all use password `test1234`)

| Email | Display name | Scenario |
|---|---|---|
| `marek@firma.pl` | Marek Kowalski (elektryk) | 8 jobs, 3 done + 5 pending — `default` |
| `anna@firma.pl`  | Anna Nowak (hydraulik)    | 6 jobs; iOS client simulates offline   |
| `piotr@firma.pl` | Piotr Wójcik (klimatyzacja) | 5 jobs + 1 with `is_new=1` — `new` |
| `kasia@firma.pl` | Katarzyna Zielińska (ogolne) | 8 jobs, all done — `empty`           |

## Tests

```bash
bun test
```

Tests run against in-memory SQLite — they do not touch `./data/`.

## Deployment

Coolify on the user's RPi consumes `docker-compose.yml`. Volume `field-notebook-data` persists `app.db` and uploaded photos across redeploys.

Required env vars in the Coolify UI:
- `JWT_SECRET` — at least 32 chars, set ONCE at deploy time and never rotate without forcing a global re-login

## Smoke checklist (after every deploy)

- [ ] `curl https://<host>/health` → `{"ok":true}`
- [ ] `POST /auth/login` with `marek@firma.pl` / `test1234` → 200 with `accessToken` and `refreshToken`
- [ ] `GET /jobs` with bearer → 8 entries, none belonging to other techs
- [ ] `POST /jobs/<id>/start` → status flips to `in_progress`
- [ ] `POST /jobs/<id>/photos` with a 1×1 JPEG → 201
- [ ] Wrong password 5× → 423 on 6th attempt for that account

## Deployments

Trigger redeploys manually from the Coolify dashboard (project `mirek-rpi` → `field-notebook-backend` → Deploy). The Coolify GitHub App is installed but its push-driven auto-deploy is currently bypassed; no GitHub Actions workflow is involved.
