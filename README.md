# Dashboard — Built by you. For you.

A full-stack, highly customizable dashboard. Create an account, subscribe to services, and build
a personal dashboard out of configurable widgets that pull live data from those services —
weather, GitHub, RSS feeds, uptime monitoring, YouTube, maps — each refreshing itself on
its own schedule.

## Overview & use cases

Think of it as a replacement for your browser's new-tab page: instead of a blank screen, you get
a grid of small panels ("widgets") you configure yourself. A few examples of what you can build:

- a weather panel for your city, next to a GitHub panel showing your repo's recent commits;
- two instances of the same widget with different settings — e.g. the temperature in Cotonou and
  in Paris, side by side, refreshing independently;
- a personal control panel you keep open in a pinned tab, that updates itself without you ever
  reloading the page.

Every widget instance is yours: you pick its type, fill in its configuration (a city name, a
repo, a refresh rate), place it on the grid, and it starts refreshing on its own.

## Key features

- **Accounts** — register with an email/password, confirm the account via a token before logging
  in, then authenticate with a JWT.
- **Services** — subscribe to a service to unlock its widgets. Some need nothing (weather, RSS,
  monitoring, maps), others require linking a third-party account via OAuth2 (GitHub, YouTube).
- **Dashboard** — add a widget instance (pick a service + widget, fill in its config, choose a
  size and a refresh rate), drag it around, reconfigure it, or delete it. Two instances of the
  same widget can hold completely different configs and data.
- **Timer** — every widget instance refreshes itself automatically, at the rate you set for it,
  without touching the rest of the page.
- **Profile & admin** — a profile page for your own account, and an admin section (for accounts
  flagged as admin) to list, promote/demote, or remove users.
- **Sharing** — turn on a public, read-only link from your profile page (`/shared/:token`) so
  anyone can view your live dashboard without an account. Turn it off and the link stops working.
- **`GET /about.json`** — machine-readable description of every service and widget the server
  supports, served at the project root as required by the brief.

### Services & widgets currently available

**11 services, 37 widgets** — comfortably above the brief's minimum of `1 + team size` services (3,
for a team of 2) and `3 × team size` widgets (6). Full parameter-by-parameter reference in
[`docs/SERVICES_AND_WIDGETS.md`](docs/SERVICES_AND_WIDGETS.md).

| Service      | Auth needed            | Widgets                                                                                  |
| ------------ | ---------------------- | ---------------------------------------------------------------------------------------- |
| `weather`    | No                     | `city_temperature`, `sky_overview`, `precipitation_forecast`                             |
| `github`     | Yes (OAuth2, per user) | `recent_commits`, `security_alerts`, `repo_activity`, `user_repositories`, `repo_issues` |
| `rss`        | No                     | `article_list`, `keyword_filter`, `feed_digest`                                          |
| `monitoring` | No                     | `uptime_check`, `response_time`, `error_rate`, `latency_tracker`                         |
| `maps`       | No                     | `directions`, `cycling_route`, `place_lookup`                                            |
| `youtube`    | Yes (OAuth2, per user) | `channel_stats`, `latest_videos`, `top_content`, `watch_later`                           |
| `discord`    | Yes (OAuth2, per user) | `profile`, `my_servers`, `server_stats`, `channel_messages`                              |
| `notes`      | No                     | `sticky_note`, `checklist`                                                               |
| `calendar`   | No                     | `month_view`, `countdown`, `days_since`                                                  |
| `clock`      | No                     | `digital_clock`, `analog_clock`, `timer`                                                 |
| `website`    | No                     | `site_overview`, `knowledge_panel`, `domain_info`                                        |

## Technologies & structure

Node.js/Express backend, React (Vite) frontend, PostgreSQL via Prisma, Docker Compose. The full
breakdown of the stack (and why each choice was made) lives in [`docs/STACK.md`](docs/STACK.md),
and a diagram-backed tour of the codebase — request flow, folder layout, the widget registry
mechanism, auth, the Timer — lives in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Read the
architecture doc first if you're new to the codebase. Every candidate technology in the stack was
actually installed and exercised, not just compared on paper — see
[`docs/TECH_POC.md`](docs/TECH_POC.md); a few riskier design decisions (real SMTP delivery, the
single-attribute theme system, an HTTP status remap) were proved out the same way before the rest
of the app was built on top of them — see [`docs/POC.md`](docs/POC.md).

| Read this                                                                        | To understand                                                        |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                                   | The big picture and the map of every other document                  |
| [`docs/BACKEND.md`](docs/BACKEND.md)                                             | The API — including password hashing, OAuth2 and the server side of refresh |
| [`docs/FRONTEND.md`](docs/FRONTEND.md)                                           | The app — including the refresh Timer, widgets, themes               |
| [`docs/FRONTEND_BACKEND_COMMUNICATION.md`](docs/FRONTEND_BACKEND_COMMUNICATION.md) | Endpoints, status codes and end-to-end flows between the two       |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md)                             | The database schema, its constraints and indexes                     |
| [`docs/DECISIONS.md`](docs/DECISIONS.md)                                         | Why each technical choice was made, and its cost                     |
| [`docs/BENCHMARK.md`](docs/BENCHMARK.md)                                         | Measured performance of the stack and its alternatives               |

```
.
├── backend/     Express API — auth, dashboard CRUD, services, admin, /about.json
├── frontend/    React app (Vite + Tailwind) — login/register, dashboard, services, admin
├── docs/        Architecture, stack rationale, meeting notes
└── docker-compose.yml
```

## Install & run

Requires Docker and Docker Compose. Nothing else — dependencies are installed inside the
containers.

```bash
git clone <this-repo>
cd G-WEB-500-COT-5-1-dashboard-53
docker compose up --build
```

That's it: this works cold, with zero manual setup. It starts four containers — `db`
(PostgreSQL), `backend` (port `8080`, runs its own migrations on boot), `frontend` (port `5173`),
`mailhog` (fake SMTP + web inbox on port `8025`, catches confirmation emails).

- App: [http://localhost:5173](http://localhost:5173)
- API root / contract check: [http://localhost:8080/about.json](http://localhost:8080/about.json)

`rss`, `monitoring` and `maps` work with zero configuration. To use `weather`, `github`, `youtube`
with real data (rather than an error shown on the widget), copy `.env.example` to
`.env` at the repo root, fill in the credentials for whichever service you want (see
[`docs/SERVICES_AND_WIDGETS.md`](docs/SERVICES_AND_WIDGETS.md) for exactly what each one needs and
where to get it — an OpenWeather API key, a GitHub/Google OAuth app, etc.), and
`CREDENTIALS_ENCRYPTION_KEY` (see the comment above it in `.env.example` for how to generate one,
required as soon as any OAuth service is linked) — then `docker compose up --build` again. None of
this is required for the app to start or for the dashboard's CRUD/timer/admin features to work.

### First admin account

There's no seeded admin — the app has no way to create one from inside itself, by design. To make
your first account an admin, set `ADMIN_EMAILS=you@example.com` (comma-separated for more than
one) in your `.env` **before** registering that account.

### Local development (without Docker)

```bash
npm install                 # installs both workspaces, generates the Prisma client
docker compose up -d db     # just the database
npm run dev:backend         # http://localhost:8080
npm run dev:frontend        # http://localhost:5173
```

### Everyday commands

| Command                  | Does what                             |
| ------------------------ | ------------------------------------- |
| `npm run lint`           | ESLint across backend + frontend      |
| `npm test -w backend`    | Backend test suite (Jest + Supertest) |
| `npm run format`         | Prettier, whole repo                  |
| `docker compose logs -f` | Tail every container's logs           |

## Usage

1. Go to `/register`, create an account. A real confirmation email is sent — caught by
   [MailHog](http://localhost:8025) (a fake SMTP server bundled in `docker-compose.yml`, no setup
   needed) rather than delivered to a real inbox. Open that page, find the email, and click its
   link. Point `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` at a real provider in `.env` to
   deliver actual emails instead — see `.env.example`.
2. Log in.
3. Open **Manage services** to subscribe to a no-auth service (weather, RSS, monitoring, maps —
   instant) or connect an OAuth one (GitHub, YouTube — redirects to that provider's login).
4. On the dashboard, click **+ Add widget**, pick a service and a widget, fill in its config and
   a refresh rate, and confirm — it appears on the board and starts refreshing itself.
5. Drag a widget to reposition it, use **Edit** to reconfigure it, **Delete** to remove it.
6. **Profile** shows your account; **Admin** (visible only to admin accounts) lists every user and
   lets you promote, demote, or remove one.

## Team

- ALAO Olaife — Dashboard & Infrastructure (auth, dashboard CRUD, timer, admin, `/about.json`,
  Docker/CI)
- DEGNON Kimberly — Content & Widgets (weather, GitHub, RSS, monitoring, maps, YouTube,
  their widgets, service subscription)
