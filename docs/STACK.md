# Technical stack

**Full JavaScript/TypeScript-ready** stack: a single language across the whole project, which
matters since the team (2 people) has to touch both the front and the back end.

## Frontend

| Layer        | Choice         | Role                                                                            |
| ------------ | -------------- | ------------------------------------------------------------------------------- |
| UI framework | React 18       | Components, local widget state                                                  |
| Build tool   | Vite 5         | Fast dev server (HMR), production build                                         |
| Routing      | React Router 7 | Pages (`/login`, `/register`, `/` dashboard, `/services`, `/profile`, `/admin`) |
| Styling      | Tailwind CSS 3 | Utility-first, no custom CSS to maintain                                        |
| HTTP client  | Axios          | Calls to the backend API, interceptors (JWT, 401 → redirect to login)           |

## Backend

| Layer                           | Choice                  | Role                                                 |
| ------------------------------- | ----------------------- | ---------------------------------------------------- |
| Runtime                         | Node.js 20              |                                                      |
| HTTP framework                  | Express 4               | Routing, middlewares                                 |
| ORM                             | Prisma 5                | Models, migrations, typed client for Postgres        |
| Database                        | PostgreSQL 16           | Persistence (users, subscriptions, widget instances) |
| Auth                            | jsonwebtoken + bcryptjs | Stateless JWT, password hashing                      |
| Validation                      | express-validator       | Payload validation (register/login)                  |
| HTTP client (external services) | Axios                   | Calls to OpenWeatherMap and the GitHub REST API      |
| Logging                         | morgan                  | Request logs in development                          |
| Email                           | Nodemailer              | Sends the account confirmation email over SMTP       |

## Integrated external services

| Service         | Auth required            | Usage                                                                |
| --------------- | ------------------------ | -------------------------------------------------------------------- |
| OpenWeatherMap  | No (server-side API key) | Widgets `city_temperature`, `sky_overview`, `precipitation_forecast` |
| GitHub REST API | Yes (OAuth2, per user)   | Widgets `recent_commits`, `security_alerts`, `repo_activity`         |

Both are called via plain HTTP through Axios — see [STACK_COMPARISON.md](./STACK_COMPARISON.md)
for why the `@octokit/rest` SDK isn't used.

## Tests & quality

| Tool                                | Role                                 |
| ----------------------------------- | ------------------------------------ |
| Jest                                | Backend test runner                  |
| Supertest                           | Integration tests for Express routes |
| ESLint (+ `eslint-config-prettier`) | JS/JSX linting                       |
| Prettier                            | Formatting                           |
| Husky + lint-staged                 | Automatic lint/format on commit      |

## Infrastructure

| Tool                    | Role                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| Docker / Docker Compose | 4 services: `db` (Postgres), `mailhog` (fake SMTP inbox), `backend`, `frontend` |
| GitHub Actions          | CI: lint, backend tests, Docker image builds, `/health` smoke test              |

## Organization

| Tool         | Role                                                                |
| ------------ | ------------------------------------------------------------------- |
| Git / GitHub | Code, code review (PRs), one branch per feature                     |
| Notion       | Task tracking (board), meeting notes, tooling comparison (brief §9) |
