# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

wedcms is a NestJS 11 application that serves as the backend/CMS for a Habbo Hotel retro website (targeting the Kepler emulator). It uses Handlebars (hbs) as a server-side template engine to render classic Habbo-style pages.

## Commands

- **Install**: `pnpm install`
- **Dev server**: `pnpm run start:dev` (watch mode, port 3000)
- **Docker dev**: `docker compose -f dev.compose.yml up` (hot-reload via Docker watch)
- **Build**: `pnpm run build`
- **Lint**: `pnpm run lint` (ESLint with auto-fix)
- **Format**: `pnpm run format` (Prettier)
- **Unit tests**: `pnpm run test` (Jest, specs in `src/`)
- **Single test**: `pnpm run test -- --testPathPattern=<pattern>`
- **E2E tests**: `pnpm run test:e2e` (Jest, specs in `test/`)

## Architecture

- **Framework**: NestJS 11 with Express adapter (`NestExpressApplication`)
- **Database**: MySQL via TypeORM (`autoLoadEntities: true`, `synchronize: true`)
- **Session**: `express-session` with in-memory store; user stored in `req.session.user`
- **Template engine**: Handlebars (hbs) with custom helpers registered in `src/main.ts`:
  - `inc` — increments an integer value
  - `eachInMap` — iterates an object as key/value pairs
  - `ifCond` — conditional with operators: `==`, `===`, `!=`, `!==`, `<`, `<=`, `>`, `>=`, `&&`, `||`, `startsWith`, `includes`
- **Views**: `views/` directory; layouts in `views/layouts/`; partials in `views/partials/`
- **Static assets**: served from `public/`
- **Module resolution**: TypeScript `nodenext` module system (use `.js` extensions in imports or rely on NestJS barrel patterns)

## Module Structure

### `src/api/` — Data / service layer (no views)

| Module              | Description                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `announcements`     | News announcements from DB                                                                  |
| `messenger-friends` | Messenger friend list from DB                                                               |
| `news`              | News articles from DB                                                                       |
| `rcon`              | TCP RCON client for Kepler commands (hotel alert, refresh credits/looks/hand/club, forward) |
| `rooms`             | Room data from DB                                                                           |
| `settings`          | App settings from DB + in-memory cache; `TextsService` loads `texts/en.json` for i18n       |
| `users`             | User accounts from DB (argon2 password hashing)                                             |

### `src/frontend/` — Page controllers (render Handlebars views)

| Module          | Route(s)                                         |
| --------------- | ------------------------------------------------ |
| `index`         | `/`                                              |
| `home`          | `/home`                                          |
| `hotel`         | `/hotel`, `/hotel/...`                           |
| `news`          | `/news`, `/news/:id`                             |
| `client`        | `/client`                                        |
| `login`         | `/login` (GET + POST)                            |
| `logout`        | `/logout`                                        |
| `register`      | `/register` (GET + POST)                         |
| `preferences`   | `/preferences/...`                               |
| `credits`       | `/credits`, `/credits/...`                       |
| `club`          | `/club`, `/club/...`                             |
| `iot`           | `/iot`, `/iot/step2`, `/iot/step3`, `/iot/step4` |
| `badges`        | `/badges` proxy to Minerva imaging service       |
| `habbo-imaging` | `/habboimage` proxy to Minerva imaging service   |

### `src/common/` — Shared utilities

- **`AuthGuard`** — session-based guard; redirects unauthenticated requests to `/login?redirect=<url>`
- **`@RequireAuth()`** — decorator that applies `AuthGuard`
- **`@Layout(name)`** — class/method decorator; sets the HBS layout and wires `NestRender` automatically
- **`@Render(view)`** — stores the view name in metadata (used by `Layout` and `ViewDataInterceptor`)
- **`@SessionUserId()`** — param decorator that extracts `req.session.user.id`
- **`ViewDataInterceptor`** — global interceptor that merges into every view response:
  - `app` — cached app settings from `SettingsService`
  - `env` — `{ kepler_hostname, kepler_server_port, kepler_mus_port }` from environment
  - `user` — session user object (if logged in)
  - `clubDaysLeft` — computed HC days remaining (if logged in with an active club)
  - `text` — i18n strings for the current layout from `TextsService`
  - `layout` — resolved layout path (`layouts/<name>`)
  - `page` / `subPage` — current view name for active-state highlighting

## Environment Variables

| Variable             | Default        | Description             |
| -------------------- | -------------- | ----------------------- |
| `PORT`               | `3000`         | HTTP listen port        |
| `SESSION_SECRET`     | `changeme`     | express-session secret  |
| `MYSQL_HOSTNAME`     | —              | MySQL host              |
| `MYSQL_PORT`         | —              | MySQL port              |
| `MYSQL_USER`         | —              | MySQL username          |
| `MYSQL_PASSWORD`     | —              | MySQL password          |
| `MYSQL_DATABASE`     | —              | MySQL database name     |
| `KEPLER_HOSTNAME`    | `192.168.1.41` | Kepler game server host |
| `KEPLER_SERVER_PORT` | `12321`        | Kepler game server port |
| `KEPLER_MUS_PORT`    | `12322`        | Kepler MUS port         |
| `RCON_HOST`          | `192.168.1.41` | Kepler RCON host        |
| `RCON_PORT`          | `12309`        | Kepler RCON port        |

## View System Conventions

- Layouts live in `views/layouts/<layout>.hbs` (e.g. `main`, `client`, `login`, `register`, `iot`)
- Page templates live in `views/<layout>/<page>.hbs` or `views/<layout>/<section>/<page>.hbs`
- Partials live in `views/partials/<layout>/...` and are registered recursively at startup
- Use the `@Layout('main')` + `@Render('home')` pattern on controllers; the `Layout` decorator composes them into `NestRender('main/home')`
- All available page identifiers are in `src/common/enums/page.enum.ts`
- i18n strings are loaded from `texts/en.json` keyed by layout then page name

## Code Style

- Prettier: single quotes, trailing commas
- ESLint: `@typescript-eslint/no-explicit-any` is off; `no-floating-promises` and `no-unsafe-argument` are warnings
- `strictNullChecks` enabled; `noImplicitAny` disabled
