# Technology proof of concept

> Companion to [STACK_COMPARISON.md](./STACK_COMPARISON.md). That document gives the comparison
> table and the reasoning; this one is the evidence behind it — every alternative listed there was
> actually installed and exercised, not judged on reputation alone. All results below were
> produced by really running the commands shown, in a throwaway workspace outside this repo, on
> 2026-09-22. Nothing here is a simulated or estimated number.

## Method

For each category (frontend, backend, database) we took the real piece of the project the
technology would replace — the `GET /about.json` route, or the `city_temperature` widget, or the
Prisma schema — and rebuilt the smallest possible working equivalent with each alternative. We
recorded what happened: install time, footprint, whether it ran, and any error encountered along
the way. A technology that broke or needed extra work to get running is reported exactly as it
happened, including the failure — that's part of the evidence, not something to hide.

## Frontend: React vs. Vue vs. Svelte

Reference component: [`CityTemperature.jsx`](../frontend/src/widgets/weather/CityTemperature.jsx),
already live in the project (React + Vite). We rebuilt the same component — same props (`data`,
`fetchedAt`), same conditional rendering — in Vue and Svelte, then ran a production build for each.

### React (current choice — already running in production here)

No separate POC needed: it's the actual codebase. `npm run build` in `frontend/` produces a
working bundle today, exercised by the whole test suite and the live `docker-compose up` run.

### Vue 3 (Composition API, `<script setup>`)

```vue
<script setup>
defineProps({
  data: Object,
  fetchedAt: String,
})
</script>

<template>
  <div class="frame">
    <template v-if="data">
      <p class="city">{{ data.city }}</p>
      <p class="temp">{{ Math.round(data.temperature) }}°C</p>
      <p class="feels">Feels like {{ Math.round(data.feelsLike) }}°C</p>
    </template>
    <p v-else class="empty">No data yet.</p>
    <p v-if="fetchedAt">Updated {{ new Date(fetchedAt).toLocaleTimeString() }}</p>
  </div>
</template>
```

Scaffolded with `npm create vite@latest -- --template vue`, installed, built.

| Metric | Result |
|---|---|
| Scaffold time | 6s |
| `npm install` | 35 packages, ~1 min |
| `npm run build` | succeeded, 122ms |
| Output bundle (JS) | 61.52 kB (24.34 kB gzip) |
| Lines to port the widget | 19 (one `.vue` file, template + script in the same file) |

No errors. The Composition API's `defineProps` is a close match for React props; the main
adjustment is template syntax (`v-if`/`v-else` instead of JSX ternaries).

### Svelte 5 (runes)

```svelte
<script>
  let { data, fetchedAt } = $props();
</script>

<div class="frame">
  {#if data}
    <p class="city">{data.city}</p>
    <p class="temp">{Math.round(data.temperature)}°C</p>
    <p class="feels">Feels like {Math.round(data.feelsLike)}°C</p>
  {:else}
    <p class="empty">No data yet.</p>
  {/if}
  {#if fetchedAt}
    <p>Updated {new Date(fetchedAt).toLocaleTimeString()}</p>
  {/if}
</div>
```

Scaffolded with `npm create vite@latest -- --template svelte`, installed, built.

| Metric | Result |
|---|---|
| `npm install` | 39 packages, 35s |
| `npm run build` | succeeded, 248ms (112 modules — Svelte's compiler expands its own runtime) |
| Output bundle (JS) | 30.02 kB (11.82 kB gzip) — the smallest of the three |
| Lines to port the widget | 16 |

No errors either. Svelte 5's `$props()` rune reads almost identically to a React functional
component's destructured props — the easiest of the three to port from our actual code, and the
smallest bundle.

### Verdict

Both alternatives work fine and produce smaller bundles in isolation. Neither failed or surfaced a
blocker. The deciding factor genuinely is what's in [STACK_COMPARISON.md](./STACK_COMPARISON.md):
the team already knows React, and a dashboard with a handful of widgets doesn't push bundle size
into a range where 30 kB vs 61 kB matters. Bundle size is the one place Svelte has a real,
measured edge — noted for the record, not disputed, just not decisive here.

## Backend: Express vs. Fastify vs. NestJS

Reference route: `GET /about.json` — see the real
[`about.controller.js`](../backend/src/controllers/about.controller.js) +
[`about.route.js`](../backend/src/routes/about.route.js) (28 lines combined, 2 files).

### Express (current choice — already running in production here)

Already the real implementation. No separate POC needed.

### Fastify

```js
const fastify = require('fastify')({ logger: false });

fastify.get('/about.json', async (request) => ({
  client: { host: request.ip },
  server: { current_time: Math.floor(Date.now() / 1000), services },
}));

fastify.listen({ port: 8099 }, () => console.log('listening on :8099'));
```

| Metric | Result |
|---|---|
| `npm install fastify` | 41 packages, <1s (already cached) |
| Footprint | 15 MB `node_modules` in an isolated install |
| Boilerplate | 1 file, no separate router/controller split needed |
| Actually running it | ✅ started immediately |
| Real response (`curl`) | `HTTP 200`, `time_total=0.0038s`, correct JSON body |

No errors, no surprises. Fastify is a drop-in replacement for this specific route — the API shape
(`fastify.get(path, handler)`) is close enough to Express that the port took under five minutes.

### NestJS

This is where the POC earned its keep — it did **not** work on the first attempt.

```ts
// app.controller.ts
@Controller()
export class AppController {
  @Get('about.json')
  getAbout(@Req() request: any) {
    return {
      client: { host: request.ip },
      server: { current_time: Math.floor(Date.now() / 1000), services },
    };
  }
}

// app.module.ts
@Module({ controllers: [AppController] })
export class AppModule {}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(8098);
}
bootstrap();
```

**First run — failed.** Installing `typescript` pulled the latest release (7.0.2, the new
Go-based rewrite) alongside `ts-node@10.9.2`. Running it produced a real crash before our code
even loaded:

```
TypeError: Cannot read properties of undefined (reading 'fileExists')
    at readConfig (node_modules/ts-node/dist/configuration.js:91:33)
```

`ts-node` reads TypeScript's internal `ts.sys` object, and TypeScript 7's rewrite changed its
shape — `ts-node` (last published for the TS 5.x line) doesn't know how to read it. This is
exactly the kind of "unknown unknown" a POC is meant to surface before it costs a day mid-project:
picking a framework that leans on a TypeScript toolchain also means inheriting that toolchain's
own compatibility churn, on top of the framework's.

**Fixed by pinning `typescript@^5.5`** (a deliberate choice a real project would also have to make
today) — after that, it ran cleanly:

| Metric | Result |
|---|---|
| `npm install` (Nest core) | 98 packages, ~20s |
| `npm install` (TS toolchain: `typescript`, `ts-node`, `@types/node`) | +21 packages, ~19s |
| Footprint | 51 MB `node_modules` (vs. 15 MB for Fastify, in the same kind of isolated install) |
| Boilerplate | 3 files, 42 lines, for what Express does in 2 files, 28 lines |
| Actually running it | ❌ then ✅ (after pinning TypeScript) |
| Real response (`curl`), once running | `HTTP 200`, `time_total=0.0043s`, correct JSON body |

### Verdict

Fastify is a safe, low-friction swap that changed nothing about our conclusion. NestJS's own
functionality is fine once it runs — the real cost is everything around it: a TypeScript
toolchain the rest of this plain-JS project doesn't otherwise need, a version-pinning problem we
had to solve just to get "hello world" running, and 3x the boilerplate for an identical route.
That's concrete support for the call already made in
[STACK_COMPARISON.md](./STACK_COMPARISON.md): Nest's architecture is a cost paid up front,
independent of whether the app ever grows into needing it.

## Database: PostgreSQL vs. SQLite vs. MongoDB

Reference: the real
[`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) — `User`, `ServiceSubscription`
(with a `Json?` credentials column), `WidgetInstance` (two `Json` columns, a `String` enum-backed
`Role`).

### PostgreSQL (current choice — already running in production here)

Already the real database. `docker-compose up` boots it, `prisma migrate deploy` applies the real
migration, and all 53 backend tests run against the real schema (mocking only the network I/O to
external services, never the database layer).

### SQLite

We pointed the **exact same schema file** at SQLite (`provider = "sqlite"`, same Prisma version,
`5.14.0`, actually pinned to match this project — not "latest") and ran `prisma migrate dev`.

**It didn't validate:**

```
error: Error validating field `config` in model `WidgetInstance`: Field `config` in model
`WidgetInstance` can't be of type Json. The current connector does not support the Json type.

error: Error validating field `position` in model `WidgetInstance`: ... can't be of type Json.

error: Error validating: You defined the enum `Role`. But the current connector does not
support enums.

Validation Error Count: 4
```

This isn't a style preference or a benchmark number — it's a hard schema incompatibility, found
by literally trying to migrate our real schema. SQLite's Prisma connector supports neither `Json`
columns nor native enums, and our schema uses both for reasons that matter: `ServiceSubscription
.credentials` needs to be a flexible per-service blob (a GitHub token looks nothing like a future
Steam API key), and `WidgetInstance.config`/`position` are exactly as free-form. Making this work
on SQLite would mean serializing those fields to plain strings ourselves and losing Prisma's
validation on them — a real regression, not a hypothetical one.

### MongoDB

Not run live: pulling a MongoDB image (`docker pull mongo:7`) in this environment didn't finish
within a reasonable budget, so this is a schema-design comparison rather than an executed
migration — flagged here rather than presented as more than it is.

Modeling the same data with Mongoose:

```js
const userSchema = new Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  name: String,
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
});

const serviceSubscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  serviceName: String,
  credentials: Schema.Types.Mixed, // no schema-level shape at all
});
serviceSubscriptionSchema.index({ userId: 1, serviceName: 1 }, { unique: true });
```

This works, and `credentials`/`config` map naturally onto a document store — arguably *more*
naturally than a `Json` column bolted onto a relational one. What doesn't map as naturally:
`onDelete: Cascade` (deleting a `User` and having their `ServiceSubscription`/`WidgetInstance`
rows disappear automatically) has no built-in equivalent — it has to be hand-written as
application-level cleanup code or a change-stream listener, where Postgres does it as one line in
the schema (already relied on in the real schema today).

### Verdict

The SQLite result is the strongest piece of evidence produced by this whole POC: our actual schema
does not run on it, full stop, not "runs but isn't ideal." MongoDB would run, but trades one
schema-flexibility win for reintroducing, by hand, a guarantee (cascade delete) the project
already gets for free. PostgreSQL remains the only candidate that runs the real schema unmodified
with zero compromises — which is exactly what
[STACK_COMPARISON.md](./STACK_COMPARISON.md) already concluded, now with a reproducible error
message behind it instead of just an argument.

## Summary

| Category | Candidate | Ran without changes? | Headline finding |
|---|---|---|---|
| Frontend | React | ✅ (in production) | — |
| Frontend | Vue | ✅ | Smaller bundle, no blockers |
| Frontend | Svelte | ✅ | Smallest bundle, no blockers |
| Backend | Express | ✅ (in production) | — |
| Backend | Fastify | ✅ | Drop-in replacement, ~3.5x smaller footprint |
| Backend | NestJS | ❌ then ✅ | Real TS7/ts-node incompatibility hit and fixed; 3x the boilerplate once running |
| Database | PostgreSQL | ✅ (in production) | — |
| Database | SQLite | ❌ | Our schema fails to validate — no `Json`, no native enums |
| Database | MongoDB | *(not executed — see note)* | Cascade delete becomes hand-written app code |

None of this changes the conclusion in [STACK_COMPARISON.md](./STACK_COMPARISON.md) — if
anything, running the alternatives instead of just reading about them turned up harder evidence
(a real validation error, a real crash log) than the qualitative comparison alone had.
