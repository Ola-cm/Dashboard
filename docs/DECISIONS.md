# Architecture decision record

The significant technical decisions taken on this project, why they were taken, and what they cost.
Each entry follows the same shape: **context** (the problem), **decision**, **consequences** (what
it gives and what it costs). Entries are never rewritten after the fact: a decision that changes
gets a new entry that supersedes the old one.

Related evidence: [STACK_COMPARISON.md](./STACK_COMPARISON.md) (qualitative comparison),
[TECH_POC.md](./TECH_POC.md) (the alternatives actually installed and run),
[BENCHMARK.md](./BENCHMARK.md) (measured performance), [POC.md](./POC.md) (riskier designs proved
before building on them).

## Index

| #  | Decision                                                            | Area       |
| -- | ------------------------------------------------------------------- | ---------- |
| 1  | Monorepo with npm workspaces, one `docker-compose.yml`               | Project    |
| 2  | React + Vite for the frontend                                       | Stack      |
| 3  | Express for the backend                                             | Stack      |
| 4  | PostgreSQL with Prisma                                              | Stack      |
| 5  | Stateless JWT sessions instead of server sessions                   | Security   |
| 6  | bcrypt for password hashing                                         | Security   |
| 7  | Email confirmation, with MailHog as the default SMTP                | Accounts   |
| 8  | 401 is reserved for the API's own authentication                    | API        |
| 9  | Sensitive account actions require the current password              | Security   |
| 10 | A self-describing widget registry behind `/about.json`              | Widgets    |
| 11 | Providers called in-process, not as separate services               | Widgets    |
| 12 | Pull-based refresh: one timer per widget in the browser             | Widgets    |
| 13 | Hand-written OAuth2 instead of Passport                             | OAuth      |
| 14 | One generic OAuth route pair for every provider                     | OAuth      |
| 15 | Third-party tokens encrypted at rest (AES-256-GCM)                  | Security   |
| 16 | YouTube as an OAuth service; `streaming` removed                    | Widgets    |
| 17 | Retry transient network failures; resolve DNS to IPv4 first         | Reliability|
| 18 | Themes as CSS variables switched by one attribute                   | Frontend   |
| 19 | Theme and wallpaper stored per browser                              | Frontend   |
| 20 | Floating app shell with `position: fixed`, not `sticky`             | Frontend   |
| 21 | GDPR notice written from the code, contact set per deployment      | Compliance |
| 22 | Widgets stay frozen between refreshes                               | Widgets    |
| 23 | In-app confirmation dialogs instead of native `confirm`             | Frontend   |
| 24 | Clock time from an external API, not the server clock              | Widgets    |
| 25 | Discord messages read by a bot, public channels only               | OAuth      |

---

### 1. Monorepo with npm workspaces, one `docker-compose.yml`

- **Context.** The brief requires the whole project to start with a single `docker-compose up`;
  two people work on the backend and the frontend at the same time.
- **Decision.** One repository, npm workspaces `backend` and `frontend`, one compose file running
  `db`, `mailhog`, `backend`, `frontend`.
- **Consequences.** One install, one lint/format config, one CI pipeline, and changes spanning both
  sides land in a single branch. Both Docker images copy the source at build time (no bind mount),
  so a code change requires rebuilding the image — easy to forget during development.

### 2. React + Vite for the frontend

- **Context.** A widget dashboard: many small, independent, stateful components.
- **Decision.** React 18 with Vite (Tailwind for styling), after building the same widget in Vue
  and Svelte ([TECH_POC.md](./TECH_POC.md)).
- **Consequences.** The team already knew React; its component model maps one-to-one to widgets.
  Svelte and Vue produced smaller bundles, which doesn't matter at this scale.

### 3. Express for the backend

- **Context.** A modest REST API with a handful of resources and many outbound HTTP calls.
- **Decision.** Express 4, compared against Fastify and NestJS by actually running them
  ([TECH_POC.md](./TECH_POC.md), [BENCHMARK.md](./BENCHMARK.md)).
- **Consequences.** Minimal and universally known. Fastify is faster, but the API's latency is
  dominated by database and third-party calls, not by framework overhead; NestJS adds structure
  a two-person project doesn't need.

### 4. PostgreSQL with Prisma

- **Context.** Relational data (users → subscriptions, widgets) plus free-form per-widget config.
- **Decision.** PostgreSQL 16 through Prisma: typed client, migrations, native JSON columns and
  enums.
- **Consequences.** Widget configs, positions and encrypted credentials are JSON columns; cascade
  deletes make account deletion a single query. SQLite was rejected because our schema doesn't
  validate on it (no JSON, no enums in Prisma's SQLite connector).

### 5. Stateless JWT sessions instead of server sessions

- **Context.** An API consumed by a single-page app, with no need for server-rendered pages.
- **Decision.** Login returns a JWT (HS256, `sub` + `role`, 7 days by default) sent as a Bearer
  header; the backend keeps no session store. `requireAuth` still reloads the user from the
  database on every request.
- **Consequences.** No session store to run or scale; deleting a user or changing a role takes
  effect immediately because the database is re-read. A token can't be revoked early — changing
  a password doesn't log out other devices. OAuth needs another way to carry the user across
  redirects (decision 13).

### 6. bcrypt for password hashing

- **Context.** Passwords must never be recoverable, even from a stolen database.
- **Decision.** `bcryptjs` with a cost factor of 10: a random salt per password, stored inside the
  hash, and a deliberately slow computation ([BACKEND.md](./BACKEND.md#how-passwords-are-hashed)).
- **Consequences.** Identical passwords give different hashes; brute force is costly; the cost can
  be raised later without migrating existing hashes. `bcryptjs` is pure JavaScript (no native build
  step in Docker), slower than the native `bcrypt` module — acceptable for a login.

### 7. Email confirmation, with MailHog as the default SMTP

- **Context.** The brief requires confirming accounts, and the project must run without anyone's
  real email credentials.
- **Decision.** A real confirmation email via nodemailer, pointed by default at a MailHog container
  (fake SMTP with a web inbox). Proved end to end in [POC.md](./POC.md).
- **Consequences.** The full flow works out of the box; switching to a real provider is only
  environment variables. If SMTP is down, registration still succeeds and logs the link.

### 8. 401 is reserved for the API's own authentication

- **Context.** The frontend logs the user out on any 401. Third-party providers answer 401 when a
  linked account's token is missing or revoked, and a wrong password is naturally "unauthorized".
- **Decision.** Only `requireAuth` returns 401. A provider's 401 is remapped to **424** and a wrong
  password on a sensitive action is a **403** ([POC.md](./POC.md)).
- **Consequences.** A broken GitHub link or a typo in a password no longer kicks the user out of
  the whole app; the error shows where it belongs. Every new code path must respect the rule
  (there are tests for it).

### 9. Sensitive account actions require the current password

- **Context.** A session left open or a stolen token should not be enough to take over or destroy
  an account.
- **Decision.** Changing the email or password and deleting the account require the current
  password. A new email must be confirmed again. The last admin can't delete their own account.
- **Consequences.** Slightly more friction for rare actions; an email typo can still be fixed from
  the current session since it stays valid until the next login.

### 10. A self-describing widget registry behind `/about.json`

- **Context.** The brief imposes `GET /about.json` listing every service, widget and parameter, and
  the project should grow to many services without merge conflicts.
- **Decision.** Each service declares its widgets' metadata in its own `catalog.js`; a definition
  file registers it at startup; `/about.json` serves the registry as-is; the frontend builds its
  "Add a widget" form from the same document.
- **Consequences.** The contract, the validation of widget configs and the UI can't drift apart —
  they read the same source. Adding a service is mostly adding files, which let two people add
  services in parallel.

### 11. Providers called in-process, not as separate services

- **Context.** Every widget's data comes from some third-party API, and each service needs its own
  client code.
- **Decision.** One module per service (`provider.js` dispatching to `client.js`), called directly
  through `providerRegistry.fetchWidgetData` in the same Node process.
- **Consequences.** No internal HTTP hop, no extra containers, one place to add retries. All
  providers share one process: a very slow provider only slows its own widgets' requests, since
  Node handles them concurrently.

### 12. Pull-based refresh: one timer per widget in the browser

- **Context.** The brief asks each widget instance to refresh at its own configurable rate.
- **Decision.** Each widget card runs its own interval in the browser and polls
  `GET /widgets/:id/data`; the server fetches fresh provider data on every call, with no cache and
  no server-side scheduler. Minimum rate: 5 seconds, enforced by the server.
- **Consequences.** Simple and stateless on the server, naturally scoped to widgets actually on
  screen, and a failing widget can't affect the others. The costs: provider calls scale with open
  dashboards × widgets ÷ rate, and browsers throttle timers in background tabs. WebSockets or
  server push were not needed at this scale.

### 13. Hand-written OAuth2 instead of Passport

- **Context.** Passport's usual setup relies on `express-session`, which contradicts decision 5.
- **Decision.** Implement the Authorization Code flow directly: the user id travels in a signed,
  10-minute JWT `state` parameter, which also protects the callback against CSRF.
- **Consequences.** A few dozen lines per provider, fully tested, no session store. Each provider's
  quirks (Google's `access_type=offline` + `prompt=consent`, Basic auth for Discord) are explicit in code.

### 14. One generic OAuth route pair for every provider

- **Context.** After GitHub, YouTube needed the same start/callback logic, then
  Discord.
- **Decision.** Every provider module exposes the same four functions; an `OAUTH_PROVIDERS` map
  drives `GET /api/services/:service/oauth/start|callback`, and `requiresAuth` is derived from it.
  The frontend shows *Connect* buttons from `requiresAuth` instead of hard-coding names.
- **Consequences.** Adding Discord took one new module and one line in the map; behavior
  (declined consent, redirects, storage) is identical for every provider.

### 15. Third-party tokens encrypted at rest (AES-256-GCM)

- **Context.** Linked-account tokens give access to users' GitHub, Google and Discord
  data.
- **Decision.** Encrypt them before storing (`CREDENTIALS_ENCRYPTION_KEY`, random IV per value, GCM
  authentication tag); decrypt only in memory when a widget needs them; refresh expired tokens
  transparently.
- **Consequences.** A database dump alone doesn't expose usable tokens; tampering is detected. The
  key becomes a secret to manage: losing it means users must reconnect their accounts.

### 16. YouTube as an OAuth service; `streaming` removed

- **Context.** A first `streaming` service covered public YouTube data with app-level keys.
  Adding per-user widgets (Watch Later, top tracks, now playing) required OAuth, which would have
  meant two services about the same platform — confusing to use and to evaluate.
- **Decision.** Remove `streaming`; keep `youtube` as a standalone OAuth service with
  four widgets, every widget using the user's own token (a user token can read public data
  too), with one shared client per service.
- **Consequences.** A clear catalog (one service per platform), one authentication model per
  service, the same pattern as GitHub. The YouTube API key disappeared; public widgets now require
  linking the account.

### 17. Retry transient network failures; resolve DNS to IPv4 first

- **Context.** Widgets intermittently failed with `ETIMEDOUT`/`ENETUNREACH`: the Docker network has
  no IPv6 route while some hosts resolve to IPv6 first, and occasional connections dropped.
- **Decision.** `dns.setDefaultResultOrder('ipv4first')` at startup, and a `withRetry` helper (2
  retries, only on network-level errors) around every provider call except monitoring.
- **Consequences.** The intermittent "Internal server error" on widgets disappeared: on the same
  geocoding call, 3 attempts out of 6 failed before the fix, 10 out of 10 succeeded after. Real HTTP errors are never retried, so they
  still surface immediately.

### 18. Themes as CSS variables switched by one attribute

- **Context.** Several themes (light, dark, spider, cherry) had to restyle every page and widget.
- **Decision.** Every color is a CSS variable; a theme redefines the variables under
  `:root[data-theme]`; Tailwind colors point at the variables ([POC.md](./POC.md)).
- **Consequences.** A new theme is one CSS block and no component change. Colors must always go
  through the Tailwind palette, never hard-coded values.

### 19. Theme and wallpaper stored per browser

- **Context.** Users can pick a theme and upload their own wallpaper.
- **Decision.** Keep both in `localStorage`, the wallpaper downscaled to 1920 px and re-encoded as
  JPEG in the browser before storing.
- **Consequences.** No upload endpoint, no file storage, instant switching. Preferences don't follow
  the account to another device; a very large image can still exceed the browser quota, which is
  reported to the user.

### 20. Floating app shell with `position: fixed`, not `sticky`

- **Context.** The sidebar and top bar had to stay visible while scrolling a long dashboard. Widgets
  are absolutely positioned, so they don't extend the page's layout box, and sticky elements stopped
  following the scroll past the first screen.
- **Decision.** Both are `position: fixed`, with in-flow spacers reserving their room; the collapsed
  state lives in `AppShell` so the top bar follows the sidebar's width.
- **Consequences.** Always visible at any scroll depth (verified at ~1,400 px). The layout must keep
  the spacers in sync with the fixed elements' sizes.

### 21. GDPR notice written from the code, contact set per deployment

- **Context.** Users need to know what is collected and why; the dashboard is self-hosted, so the
  data controller depends on who deploys it.
- **Decision.** A public `/legal` page whose every statement was checked against the code (no IP
  logs, no analytics, no cookies, the third parties actually contacted), a notice on the
  registration form, and a `LEGAL_CONTACT_EMAIL` variable for the controller's contact.
- **Consequences.** The notice must be updated whenever a service, a stored field or a third party
  is added. Rectification and erasure are self-service; data export is currently on request.

### 22. Widgets stay frozen between refreshes

- **Context.** The clocks, `countdown` and `days_since` ticked every second (the analog clock at
  20 fps) with their own browser timers, on top of the refresh Timer. The refresh rate then meant
  nothing for them, and the same dashboard mixed widgets that moved and widgets that did not.
- **Decision.** A widget shows the last response until the next refresh, whatever its type. Derived
  values (days, hours, minutes between two dates) are computed at `fetchedAt`, not at render time.
  Only `timer`, which the user starts and pauses, keeps running. Each card shows a live "next in Ns"
  counter so the wait is visible.
- **Consequences.** One rule for every widget, and a refresh rate that is always meaningful. A
  clock looks stepped: with a 60 s rate it is up to 60 s behind, which is the user's own setting.

### 23. In-app confirmation dialogs instead of native `confirm`

- **Context.** Deleting a widget or an account, or turning off sharing, used `window.confirm`: an
  unstyled system box that blocks the page and ignores the theme.
- **Decision.** One `ConfirmDialog` (portal, Escape and backdrop to cancel, focus on *Cancel*,
  `alertdialog` role) behind a `useConfirm()` hook that returns a promise, so call sites keep the
  shape `if (!(await confirm(...))) return;`.
- **Consequences.** A consistent, themeable and accessible prompt; any new confirmation reuses the
  hook. The component must be rendered by each page that asks.

### 24. Clock time from an external API, not the server clock

- **Context.** The clocks read the server's own clock through `Intl`.
- **Decision.** Ask `timeapi.io` (free, no key) for the time of the requested IANA timezone, via a
  `client.js` like every other service; `timer` stays local.
- **Consequences.** The clock is a real consumer of a third-party API, with retries and clear errors
  (400 for an unknown zone, 424 when the service is unreachable). It now depends on that service's
  availability and rate limits; a short cache or an `Intl` fallback would remove that dependency.

### 25. Discord messages read by a bot, public channels only

- **Context.** Discord exposes neither a user's notifications nor their DMs to applications, and an
  OAuth user token cannot read channels. Only a bot can read channel messages.
- **Decision.** The `channel_messages` widget uses a bot token held by the backend, and shows a
  channel only if the linked account is a member of its server **and** `@everyone` can view it and
  read its history (computed from the server roles and the channel's permission overwrites).
- **Consequences.** A bot sees far more than any single user, so this check is what stops a user
  from reading a channel by guessing its ID; private channels return 403. The bot must be invited
  with the *Message Content* intent, and the legal notice states that it reads these messages.
