# Meeting notes — Progress check-in

- **Date**: 2026-09-21
- **Attendees**: ALAO Olaife, DEGNON Kimberly
- **Purpose**: one week after kickoff, take stock of what's actually working end to end, identify
  gaps against the brief, and split the remaining work.

## 1. What's done as of this meeting

The core loop works end to end for the first time today:

- **Auth** (Olaife, 2026-09-15): register/confirm/login, JWT, protected routes.
- **Widget registry & `/about.json`** (Olaife, 2026-09-15): the shared architecture every service
  plugs into.
- **Weather service** (Kimberly, 2026-09-16): 3 widgets (`city_temperature`, `sky_overview`,
  `precipitation_forecast`), no account required.
- **GitHub service** (Kimberly, 2026-09-16): 3 widgets (`recent_commits`, `security_alerts`,
  `repo_activity`) plus the OAuth2 flow to link a GitHub account.
- **Dashboard** (Olaife, merged today): add / reconfigure / move / delete widget instances, with
  a `size` field (square/wide/tall/large) validated against known layouts.
- **Timer** (Olaife, merged today): `GET /api/dashboard/widgets/:id/data` plus a per-widget
  frontend polling loop — widgets now refresh themselves live on the dashboard.

Concretely: a user can register, confirm, log in, subscribe to weather or link GitHub, add a
widget, configure it, and watch it refresh on its own. That milestone landed today.

## 2. Gaps identified against the brief

- **Only 2 external services.** The brief requires at least `1 + X` services for a team of `X` —
  for the two of us, that's 3 minimum. `feature/service-rss` has existed as an empty stub branch
  since the initial scaffolding but nothing has been built on it yet.
- **No admin section.** The brief explicitly calls out that "an administration section would be
  very useful" for user management — nothing exists yet.
- **No profile page.**
- **GitHub credentials aren't hardened.** Tokens are stored in `ServiceSubscription.credentials`
  as-is — no encryption at rest, and the OAuth exchange only keeps the access token, not a refresh
  token, so it will silently break if the GitHub OAuth App is ever switched to expiring tokens.
- **No visual consistency pass yet.** Auth, dashboard and services pages were each styled
  independently as they were built; nothing has been unified.
- **README is still the placeholder from day one.** Needs the real install/usage/structure
  sections before this can be handed in.
- **Nothing has been tested against real third-party credentials yet** — weather, GitHub OAuth and
  the widget registry are only exercised through mocks in the test suite so far.

## 3. Task split going forward

| Owner | Next up |
|---|---|
| Olaife | Admin section (user management, bootstrapped via `ADMIN_EMAILS`), profile page, then a visual polish pass once those pages exist, and finishing the README + architecture doc |
| Kimberly | Bring the service count up (RSS first, since it's already reserved; more beyond that to strengthen the "quantity" the brief says will be evaluated), close the gap on the 2 GitHub widgets the team's task list called for (repo issues, user/org repos) that weren't originally built, and harden the GitHub token model (encryption at rest, refresh token support) |

## 4. Organization

- Keep the one-branch-per-feature workflow, PRs into `develop`.
- Notion board updated to reflect this split.
- Everyone tests locally via `docker-compose up` before opening a PR, not just via the unit test
  suite — an integration assumption in the widget registry's auto-loading already slipped through
  unit tests once and only surfaced when actually running the app.
- Next check-in once the admin/profile pages and the additional services are both in.
