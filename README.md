# WedCMS

CMS and admin panel for a Habbo Hotel retro server (Kepler emulator).

## Structure

```
apps/
  core/          # NestJS backend — serves the hotel website (port 3000)
  housekeeping/  # React SPA admin panel — served at /housekeeping
```

## Prerequisites

- [Node.js 24+](https://nodejs.org)
- [pnpm](https://pnpm.io) — `npm install -g pnpm`
- [Docker](https://docs.docker.com/get-docker/) (for the Docker-based dev workflow)

---

## Development

### 1. Configure environment

Copy the example and fill in your values:

```bash
cp apps/core/.env.example apps/core/.env
```

| Variable          | Description                        |
| ----------------- | ---------------------------------- |
| `MYSQL_HOSTNAME`  | MySQL host                         |
| `MYSQL_PORT`      | MySQL port (default: `3306`)       |
| `MYSQL_USER`      | MySQL user                         |
| `MYSQL_PASSWORD`  | MySQL password                     |
| `MYSQL_DATABASE`  | MySQL database name                |
| `MINERVA_URL`     | Minerva imaging service URL        |
| `SESSION_SECRET`  | Express session secret             |

### 2. Start with Docker (recommended)

Uses Docker watch for hot-reload on both apps without any manual restart.

```bash
docker compose -f dev.compose.yml up --watch
```

| Service        | URL                              |
| -------------- | -------------------------------- |
| Core (website) | http://localhost:3000            |
| Housekeeping   | http://localhost:3000/housekeeping |
| Minerva        | http://localhost:3002            |

The housekeeping SPA is proxied through the core in dev, so everything shares the same origin — no CORS or cookie issues when accessing from another machine on the network.

### 3. Start without Docker

Install dependencies:

```bash
pnpm install
```

Run both apps in separate terminals:

```bash
# Terminal 1 — core
pnpm dev

# Terminal 2 — housekeeping
pnpm housekeeping:dev
```

When running without Docker, the housekeeping dev server runs on port 3001 and proxies `/api` to the core on port 3000. Access housekeeping directly at `http://localhost:3001/housekeeping`.

---

## Production

### 1. Build

```bash
# Build the housekeeping SPA
pnpm housekeeping:build

# Copy the output into the core's public directory
cp -r apps/housekeeping/dist/* apps/core/public/housekeeping/

# Build the core
pnpm build
```

### 2. Configure environment

Set the same variables as in development, plus:

| Variable         | Description                                        |
| ---------------- | -------------------------------------------------- |
| `NODE_ENV`       | Set to `production` (disables the dev proxy)       |
| `PORT`           | HTTP port to listen on (default: `3000`)           |
| `SESSION_SECRET` | A strong random secret for session signing         |

### 3. Run

```bash
cd apps/core
NODE_ENV=production node dist/main
```

Or with Docker:

```bash
docker build --target prod -t wedcms .
docker run -p 3000:3000 --env-file apps/core/.env -e NODE_ENV=production wedcms
```

The core serves the housekeeping SPA as static files under `/housekeeping`. The dev proxy is disabled when `NODE_ENV=production`.
