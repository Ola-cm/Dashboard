# Stack choice — comparison and rationale

> This document answers the project brief's requirement (§9): compare at least 3 tools per
> category (front, back, database), document a mini POC, then justify the final choice. Each
> "Mini POC" below is backed by an actual hands-on test of the rejected alternatives, detailed in
> [TECH_POC.md](./TECH_POC.md) — real code ported, really installed and run, including the
> failures encountered along the way.

## Shared selection criteria

Before comparing tools against each other, the team agreed on what matters most for this
specific project:

- **Team of 2 people** touching both the front and the back end → a single language everywhere
  (JavaScript) cuts more friction than a marginal performance gain from a "better" tool.
- **Short timeline** (a few weeks) → favor what the team already knows or what has the widest
  documentation/community, rather than a tool that looks better on paper but takes longer to
  learn.
- **Contract imposed by the brief**: `GET /about.json` on port 8080, a single `docker-compose.yml`
  at the repo root, a minimum of 3 external services and 6 configurable widgets, a refresh timer,
  OAuth2 for at least one service.

## Frontend

| Criterion                           | React + Vite                                          | Vue 3 + Vite                 | Svelte / SvelteKit                    |
| ----------------------------------- | ----------------------------------------------------- | ---------------------------- | ------------------------------------- |
| Learning curve for the team         | Already used by both members                          | New to the team              | New to the team                       |
| Ecosystem (routing, state, UI kits) | Very large (React Router, huge library selection)     | Large but smaller than React | Narrower                              |
| Performance / bundle size           | Good (Vite + tree-shaking)                            | Very good                    | Excellent (no virtual DOM)            |
| Fit for a "widget dashboard"        | Many examples/patterns for drag-and-drop widget grids | Decent                       | Decent, but fewer ready-made examples |

**Mini POC**: a working Vite + React + Tailwind scaffold from day one
([frontend/](../frontend)), with routing (React Router), an auth hook (`useAuth`) and
Login/Register pages already wired to the API — validated by `npm run dev` serving the app on
`:5173`. Vue and Svelte were also actually built and run for comparison — see
[TECH_POC.md § Frontend](./TECH_POC.md#frontend-react-vs-vue-vs-svelte).

**Choice: React + Vite.** Svelte's raw performance isn't a deciding factor here (an internal
dashboard, not a high-traffic site), while the team's familiarity with React removes a learning
curve the schedule can't absorb.

## Backend

| Criterion                             | Express                            | Fastify                    | NestJS                                        |
| ------------------------------------- | ---------------------------------- | -------------------------- | --------------------------------------------- |
| Learning curve                        | Minimal, already known by the team | Low (API close to Express) | High (DI, decorators, modules)                |
| Performance                           | Adequate for this volume           | Better ([measured](./BENCHMARK.md): ~2.5× Express) | Adequate (built on top of Express internally) |
| Structural flexibility                | Total (no imposed convention)      | Total                      | Imposed (strict modular architecture)         |
| Ecosystem / middleware                | The widest in the Node ecosystem   | Good but younger           | Good but goes through wrappers                |
| Fit for a small team / short timeline | Very good                          | Good                       | Overkill for this project's size              |

**Mini POC**: an Express backend scaffolded with Prisma, `GET /health`, `GET /about.json`, and
full JWT authentication (register/confirm/login/me), tested with Jest + Supertest
([backend/](../backend), 37 tests passing via `npm test`). Fastify and NestJS were also actually
installed and run for comparison, including a real incompatibility hit and fixed along the way —
see [TECH_POC.md § Backend](./TECH_POC.md#backend-express-vs-fastify-vs-nestjs).

**Choice: Express.** Fastify would bring a performance gain that isn't needed at this scale
(a multi-user dashboard, not a high-throughput service). NestJS imposes an architecture (modules,
DI) that makes sense for larger teams/projects, but would add a disproportionate learning cost for
a team of 2 on a project this size — Express plus a folder-based organization (`controllers/`,
`routes/`, `services/`) is enough to keep the code readable.

## Database

| Criterion                                    | PostgreSQL                                                     | SQLite                                                                | MongoDB                                                                    |
| -------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Fit with the project's data model            | Relational (User ↔ Subscription ↔ WidgetInstance) — a good fit | Also relational, but designed for a single local file                 | Document-based — a worse fit for 1-N relations with uniqueness constraints |
| Data integrity constraints                   | Native foreign keys, `@@unique`, cascade delete                | Supported but a more limited engine under concurrency                 | Application-level constraints only                                         |
| Behavior in a multi-container (Docker) setup | Dedicated service, standard in production                      | Local file — poor fit with containers without an easily shared volume | Dedicated service, but overkill for this schema                            |
| Prisma support                               | Full                                                           | Full but fewer features (e.g. no real JSON types)                     | Different support model (no real relations)                                |

**Mini POC**: a `db` service (Postgres 16) in `docker-compose.yml`, a Prisma schema applied
through a migration (`prisma/migrations/20260915180718_init`), and the `User`,
`ServiceSubscription`, `WidgetInstance` models already used by the auth and subscription
endpoints. The exact same schema was actually pointed at SQLite to check — it fails to validate;
see [TECH_POC.md § Database](./TECH_POC.md#database-postgresql-vs-sqlite-vs-mongodb) for the
real error message.

**Choice: PostgreSQL.** The project's data is fundamentally relational (a user has several
subscriptions and several widget instances referencing a static catalog) — a need MongoDB
doesn't serve any better, and one SQLite handles poorly once you're running multiple containers.
`ServiceSubscription.credentials` is still kept as a `Json` field for per-service flexibility
(GitHub token vs. nothing for weather), without giving up relational constraints on the rest of
the schema.

## Summary

| Layer    | Choice                  | Alternatives ruled out  |
| -------- | ----------------------- | ----------------------- |
| Frontend | React + Vite + Tailwind | Vue 3, Svelte/SvelteKit |
| Backend  | Express + Prisma        | Fastify, NestJS         |
| Database | PostgreSQL              | SQLite, MongoDB         |

The common thread: for equal development effort, we consistently preferred the tool the team
already masters or that requires the fewest new conventions to learn, except where the project's
actual need (here: relational data) made the technical choice clear-cut.
