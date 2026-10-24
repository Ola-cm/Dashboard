# Meeting notes — Dashboard project kickoff

- **Date**: 2026-09-15
- **Attendees**: ALAO Olaife, DEGNON Kimberly
- **Duration**: ~1h (held right after the kickoff given by the teaching team)

## Purpose

First team sync right after the project kickoff. Goal: rephrase the brief's expectations
together to make sure both of us are aligned, agree on a stack, split the work and set up an
organization going forward.

## 1. Recap of the kickoff

Rephrasing the brief's key points to confirm shared understanding:

- A full-stack, customizable dashboard application: registration, login, subscribing to
  external services, adding/configuring/moving/deleting widgets.
- A minimum of **3 different external services**, a minimum of **6 configurable widgets** total.
- Every widget must have at least one configurable parameter, of type `string` or `integer` only
  (a constraint from the `/about.json` format).
- Two instances of the same widget type must be configurable independently (no config shared
  across instances of the same type).
- At least one service must use **OAuth2 authentication** to link a third-party account.
- A **Timer** system to periodically refresh widget data.
- A `GET /about.json` endpoint is mandatory, served on port **8080**.
- Delivered via a single `docker-compose.yml` at the repo root.
- The choice of tools (front, back, DB) must be **documented and justified**, backed by a
  comparison of at least 3 candidates per category (see
  [STACK_COMPARISON.md](../STACK_COMPARISON.md)).

## 2. Stack decision

Agreement on a **full JavaScript/TypeScript-ready** stack: both team members need to touch the
front and the back end, so a single language everywhere reduces friction. Decision reached after
a quick comparison (detailed in [STACK_COMPARISON.md](../STACK_COMPARISON.md)):

- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL
- **Auth**: stateless JWT (no server-side sessions)
- **Infra**: Docker Compose (3 services: db, backend, frontend), GitHub Actions CI

## 3. Task split

Split into two parts, each with a clear code ownership:

| Part                       | Owner    | Content                                                                                                                                                                                         |
| -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Part 1 — Content & Widgets | Kimberly | Pick 2 external services (Weather + GitHub), 3 configurable widgets per service, API calling/formatting logic, service subscription system, front-end display/config components for each widget |
| Part 2 — Identity & Infra  | Olaife   | Auth (register/confirm/login), dashboard (CRUD of widget instances), refresh Timer, infrastructure (Docker, CI), profile/admin views                                                            |

Interface contract agreed between the two parts: the widget registry
(`widgetRegistry.registerService`) only ever carries the metadata served by `/about.json`; the
actual data fetching goes through a dedicated function (`providerRegistry.fetchWidgetData`)
called directly by the Timer's code, with no internal HTTP round-trip. The
`ServiceSubscription` table is owned by Part 1, `WidgetInstance` by Part 2.

## 4. Work plan

- One branch per feature (`feature/xxx`), merged via Pull Request after review.
- GitHub Actions CI on every push/PR to `main`/`develop`: lint, backend tests, Docker image
  builds, `/health` smoke test.
- The initial scaffolding (npm workspaces, ESLint/Prettier/Husky, backend and frontend
  skeletons, docker-compose, first auth routes and `/about.json`) was put in place the same day
  by Olaife, so each of us could start our own part without waiting.
- Next step for Kimberly: wire the Weather and GitHub services into the already-existing
  registry (done the following day, see branches `feature/service-weather` and
  `feature/service-github`).

## 5. Organization with Notion

Set up a shared Notion workspace for:

- A task board (to do / in progress / done) mirroring the split above.
- Meeting notes (including this one).
- The §9 tooling comparison, to keep the research notes around even once the final version is
  published in this repo.

## 6. Other points discussed

- Commit convention: `feat`/`fix`/`chore`/`docs` prefixes (already applied since the first
  scaffolding commits).
- Sensitive credentials (OpenWeatherMap API key, GitHub OAuth secrets) will never be committed —
  environment variables only (`.env`, not versioned), with a `.env.example` documenting the
  expected keys.
- Next team sync to be scheduled once both services (weather, github) and the first pass at the
  dashboard/timer are in place.
