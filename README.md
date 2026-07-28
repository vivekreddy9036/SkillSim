# SkillSim

Browser-based, KodeKloud-style hands-on labs: technology tracks → labs → step-by-step
tasks, each with a real terminal (Docker-attach over WebSocket) on one side and
auto-validated instructions on the other.

See `SkillSim_Architecture.md` for the original design brief and
`C:\Users\vivek\.claude\plans\smooth-whistling-forest.md` for the current build plan.

## Layout

- `frontend/` — React + Tailwind + xterm.js UI (catalog, split-pane lab page, dashboard)
- `app-backend/` — Express + Prisma REST API: auth, track/lab/step catalog, progress/points
- `terminal-server/` — Express + `ws` + `dockerode`: owns the Docker socket, bridges
  the WebSocket to each session's container, runs step-validation execs
- `labs/` — hand-authored lab content (Dockerfile + step markdown + validation scripts
  per lab), source of truth synced into Postgres via `scripts/sync-labs.ts`

## Requirements

- Node.js 20+
- Docker Engine running locally (terminal-server talks to `/var/run/docker.sock`
  or the Windows named pipe equivalent)
- PostgreSQL

## Getting started

```bash
npm install
cp app-backend/.env.example app-backend/.env
cp terminal-server/.env.example terminal-server/.env

# throwaway local dev Postgres — published on 5433, not 5432, in case something
# else on your machine (a native Postgres install, another project) already owns 5432
docker run -d --name skillsim-postgres \
  -e POSTGRES_USER=skillsim -e POSTGRES_PASSWORD=skillsim -e POSTGRES_DB=skillsim \
  -p 5433:5432 postgres:16

npm run prisma:migrate --workspace=app-backend   # create tables from prisma/schema.prisma
npm run sync-labs                                # loads labs/ content into Postgres

# build the image each lab's imageRef points at (repeat per lab)
docker build -t skillsim/docker-basic-commands:latest labs/docker/docker-basic-commands

npm run dev:backend
npm run dev:terminal
npm run dev:frontend
```

Frontend expects the app-backend and terminal-server URLs via `VITE_API_BASE` /
`VITE_TERMINAL_WS_BASE` env vars (defaults: `http://localhost:4000` and
`ws://localhost:4100`).
