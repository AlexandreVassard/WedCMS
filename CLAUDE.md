# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root unless noted.

```bash
# Install dependencies
pnpm install

# Dev (core backend, port 3000)
pnpm dev

# Dev (housekeeping SPA, port 3001)
pnpm housekeeping:dev

# Dev with Docker (recommended — hot-reload for both apps)
docker compose -f dev.compose.yml up --watch

# Build
pnpm build                  # core
pnpm housekeeping:build     # housekeeping SPA

# Lint / test (core only)
pnpm lint
pnpm test

# Run a single Jest test
cd apps/core && pnpm test -- --testPathPattern=<pattern>
```

## Architecture

This is a **pnpm monorepo** (`apps/*`) with two packages:

| Package | Name | Description |
|---|---|---|
| `apps/core` | `wedcms-core` | NestJS backend — hotel website + API (port 3000) |
| `apps/housekeeping` | `wedcms-housekeeping` | React SPA admin panel — served at `/housekeeping` |

In production the housekeeping SPA is built and copied into `apps/core/public/housekeeping/`, then served as static files by the core. In dev, the housekeeping Vite server (port 3001) proxies `/api` requests to the core on port 3000.

See `apps/core/CLAUDE.md` for full detail on the core's internal structure, module layout, view system, environment variables, and code style.

## Housekeeping SPA (`apps/housekeeping`)

**Stack**: React 19, TanStack Router (file-based), TanStack Query, Tailwind CSS v4, Radix UI primitives, Lucide icons, Sonner toasts.

**Routing**: File-based via `@tanstack/router-plugin`. The `routeTree.gen.ts` is auto-generated — do not edit it manually. All authenticated routes live under `src/routes/_auth/`. The `_auth.tsx` layout route checks session on load (`/api/housekeeping/auth/session`) and redirects to `/login` if the user has rank < 5.

**API calls**: Use the `api` helper from `src/lib/api.ts` (`api.get`, `api.post`, `api.patch`, `api.delete`). It always sends `credentials: 'include'` and throws on non-OK responses. All housekeeping endpoints are prefixed `/api/housekeeping/`.

**UI components**: shadcn/ui-style components live in `src/components/ui/`. Compose new pages from these; don't reach for Radix primitives directly unless the wrapper doesn't exist yet.

## Housekeeping API (`apps/core/src/api/housekeeping/`)

All housekeeping controllers are guarded by `HousekeepingSessionGuard` (requires `session.user.rank >= 5`). Controllers delegate to the shared service modules in `src/api/` and never bypass them.

| Controller | Prefix |
|---|---|
| `HousekeepingAuthController` | `/api/housekeeping/auth` |
| `HousekeepingUsersController` | `/api/housekeeping/users` |
| `HousekeepingNewsController` | `/api/housekeeping/news` |
| `HousekeepingAnnouncementsController` | `/api/housekeeping/announcements` |
| `HousekeepingRoomsController` | `/api/housekeeping/rooms` |
| `HousekeepingSettingsController` | `/api/housekeeping/settings` |
| `HousekeepingRconController` | `/api/housekeeping/rcon` |
| `HousekeepingRanksController` | `/api/housekeeping/ranks` |
| `HousekeepingFuserightsController` | `/api/housekeeping/fuserights` |
| `HousekeepingCatalogueController` | `/api/housekeeping/catalogue` |

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->