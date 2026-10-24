# Stack benchmark

> Companion to [STACK_COMPARISON.md](./STACK_COMPARISON.md) (qualitative comparison) and
> [TECH_POC.md](./TECH_POC.md) (each alternative actually installed and run). Those two documents
> compared the candidates on features, footprint and bundle size; this one **measures runtime
> performance**. Every number below comes from a command that was really run on 2026-09-29, in a
> throwaway workspace outside the repository. Nothing is estimated or extrapolated; what could not
> be measured is said so.

## Summary

| Question                                      | Measured answer                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| Fastest backend framework on our `/about.json`? | **Fastify**: 18,973 req/s, ~2.5× Express (7,520) and ~3.1× NestJS (6,031)     |
| Lowest latency?                               | Fastify: p99 9 ms, vs 23 ms (Express) and 29 ms (NestJS)                        |
| Fastest cold start / lightest at idle?        | Express: 155 ms, 61 MB (NestJS: 539 ms, 97 MB)                                   |
| How does the real app do?                     | `/about.json` 3,247 req/s; authenticated DB route 213 req/s at 100 concurrent connections, p50 7 ms with 1 connection |
| PostgreSQL vs SQLite (raw engine)?            | SQLite in-process is much faster for a single client (≈12× on reads), but our schema cannot run on it |
| MongoDB?                                      | Not measured — the machine's disk was full (see [Limits](#what-could-not-be-measured)) |

**Conclusion for this project:** the measurements confirm Fastify is faster, but they don't change
the choice of Express ([DECISIONS.md](./DECISIONS.md) #3): even plain Express serves thousands of
requests per second, while the app's real cost per request is the database and third-party calls
(see part B). PostgreSQL stays the only engine that runs our actual schema.

## Environment

| Item                 | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| CPU                  | Intel Core i7-13700H, 20 threads                                       |
| RAM                  | 7.4 GB (heavily used during the runs, see caveats)                     |
| OS                   | Linux 6.5                                                              |
| Node.js              | 22.18.0 on the host (parts A and C), 20.20.2 in the backend container (part B) |
| Load generator       | autocannon 8.0.0, on the same machine                                  |
| Frameworks           | Express 4.22.3 (same version as the project), Fastify 5.12.5, NestJS 12.1.1 (platform-express, compiled with TypeScript 7.0.2) |
| Databases            | PostgreSQL 16.15 (`postgres:16-alpine`, driver `pg` 8.23), SQLite via `better-sqlite3` 13.0.3 |

## A. Backend frameworks — the same route

**Method.** The real `GET /about.json` payload (5.8 KB) was captured from the running backend.
Three minimal servers — Express, Fastify, NestJS — served that same payload, computing `client.host`
and `server.current_time` per request exactly like the project's controller, with no request
logging. Each server ran alone, and for each:

- **cold start** — time from process spawn to the first HTTP 200, median of 5 spawns;
- **memory** — resident set size (RSS) at idle and during load;
- **load** — autocannon with 100 concurrent connections: 5 s warm-up discarded, then 3 runs of
  15 s; the median run is reported. Every run had 0 errors, 0 non-2xx responses, 0 timeouts.

| Framework | Req/s (median) | Latency p50 | Latency p99 | Throughput | Cold start | RSS idle | RSS under load |
| --------- | -------------: | ----------: | ----------: | ---------: | ---------: | -------: | -------------: |
| Express 4 | 7,520          | 12 ms       | 23 ms       | 43.7 MB/s  | 155 ms     | 60.6 MB  | 127.5 MB       |
| Fastify 5 | **18,973**     | **5 ms**    | **9 ms**    | 108.9 MB/s | 218 ms     | 64.0 MB  | **97.5 MB**    |
| NestJS 12 | 6,031          | 15 ms       | 29 ms       | 35.0 MB/s  | 539 ms     | 97.2 MB  | 184.6 MB       |

<details>
<summary>Per-run values</summary>

| Framework | Run 1 req/s | Run 2 req/s | Run 3 req/s | Cold starts (ms)                       |
| --------- | ----------: | ----------: | ----------: | -------------------------------------- |
| Express   | 7,602       | 7,520       | 7,509       | 134, 155, 174, 144, 166                |
| Fastify   | 19,116      | 18,893      | 18,973      | 188, 218, 226, 243, 198                |
| NestJS    | 6,015       | 6,031       | 6,042       | 490, 550, 501, 572, 539                |

Run-to-run spread stayed under 3 %.
</details>

**Reading.** Fastify leads clearly on throughput and latency, with less memory under load — and
that without a response schema, so without its optimized serializer, which would likely widen the
gap. NestJS, which runs on top of Express here, is about 20 % below plain Express and has by far
the heaviest start-up and memory footprint (the causes of each were not profiled). Setting it up also hit a real
toolchain break: TypeScript 7 rejected a classic `tsconfig`
(`error TS5108: Option 'moduleResolution=node10' has been removed`), on top of the ts-node crash
already documented in [TECH_POC.md](./TECH_POC.md).

## B. The real application

**Method.** The same autocannon protocol (100 connections, warm-up, 3 × 15 s) against the running
Docker backend, on two routes:

- `GET /about.json` — no database;
- `GET /api/dashboard/widgets` — authenticated with a JWT, for a test user owning 10 widgets. Each
  request verifies the JWT and runs two Prisma queries (the user lookup in `requireAuth`, then the
  widget list).

This is **not** comparable one-to-one with part A: the real app also logs every request (morgan),
runs the CORS and JSON middleware, sits behind Docker's port mapping, and uses Node 20.

| Route                                     | Req/s (median) | p50    | p99    |
| ----------------------------------------- | -------------: | -----: | -----: |
| `GET /about.json`                         | 3,247          | 28 ms  | 65 ms  |
| `GET /api/dashboard/widgets` (100 conn.)  | 213            | 419 ms | 697 ms |
| same route, 10 connections (single 10 s run) | 324         | 26 ms  | 62 ms  |
| same route, 1 connection (single 10 s run)   | 133         | 7 ms   | 11 ms  |

All runs: 0 errors. During the `/widgets` load the backend container reached about 9 CPU cores
(912 % in `docker stats`), the database about 16 %.

**Reading.** A single user request on the database route answers in 7 ms; the high latency only
appears when 100 clients hammer it at once, where requests queue behind the Prisma connection pool
and the backend's CPU. The bottleneck was not profiled further; it is a direction for improvement
(pool size, avoiding the second query per request by trusting the JWT, less logging), not a
problem at the scale of a class project. It also shows why the framework choice matters little
here: the database route is ~15× slower than the static one, whatever framework sits in front.

For scale: a dashboard with 10 widgets refreshing every 60 s generates 10 requests per minute; the
measured capacity is several hundred requests per second.

## C. Databases — raw engine speed

**Method.** A table shaped like `WidgetInstance` (uuid/text id, indexed `user_id`, service and
widget names, a JSON `config`, `refresh_rate`, `created_at`), rebuilt fresh for each of 3 runs;
median reported. One client, one statement at a time, so every number includes per-statement
latency:

1. 10,000 inserts in a single transaction (100 different users);
2. 1,000 inserts, each in its own transaction;
3. 10,000 `SELECT * WHERE user_id = ?` (about 110 rows each, 1.1 million rows read);
4. 1,000 single-row `UPDATE` of `config`.

PostgreSQL ran in a separate throwaway container (not the project's database), with default
settings (`fsync` on), JSON as `jsonb`. SQLite ran in-process with JSON as `TEXT`, first with its
defaults (rollback journal, `synchronous=FULL`), then in WAL mode (`synchronous=NORMAL`).

| Engine                       | 10k inserts, 1 transaction | 1k inserts, 1 per transaction | 10k selects      | 1k updates        |
| ---------------------------- | -------------------------: | ----------------------------: | ---------------: | ----------------: |
| PostgreSQL 16                | 2,593 ms (3,857/s)          | 1,184 ms (845/s)              | 17,735 ms (564/s) | 1,166 ms (858/s) |
| SQLite, defaults             | 105 ms (95,162/s)           | 4,035 ms (248/s)              | 1,487 ms (6,725/s) | 6,659 ms (150/s) |
| SQLite, WAL                  | 58 ms (171,176/s)           | 38 ms (26,165/s)              | 1,354 ms (7,386/s) | 24 ms (41,260/s) |

**Reading.**

- SQLite runs inside the Node process, while every PostgreSQL statement is a network round trip
  (here through Docker's port mapping) plus `jsonb` decoding — which explains most of the ≈12×
  gap on reads and ≈25× on the batched insert for a single client.
- On commit-heavy work, durability settings decide everything: PostgreSQL stays steady around
  850 commits/s; SQLite with full sync is slower and very irregular (117–447 inserts/s across
  runs); SQLite WAL is very fast because it doesn't flush to disk on every commit — a durability
  trade-off, not a free win.
- This workload has a single writer. SQLite allows only one writer at a time, which a multi-user
  server would hit; that was not measured.
- **None of this makes SQLite usable for the project:** Prisma's SQLite connector has no `Json`
  type and no enums, and our actual schema fails to validate on it ([TECH_POC.md](./TECH_POC.md)).

## What could not be measured

- **MongoDB 7.** The image was pulled, but the container exited immediately and the next commands
  failed with `No space left on device`: the machine's disk was 100 % full. Re-pulling the image
  would have risked the running project database, so the run was stopped there. To complete it:
  free disk space, then run the same workload against `mongo:7` with the official driver.
- **Frontend runtime performance.** Bundle sizes and build times of React, Vue and Svelte are in
  [TECH_POC.md](./TECH_POC.md); rendering speed was not benchmarked, as a dashboard of a few dozen
  widgets is far from any rendering limit.

## Caveats

- One laptop, everything over `localhost`, with the load generator sharing the CPU with the
  servers; autocannon ran as a single process, which may cap the highest rates.
- The machine was under pressure during the runs: little free RAM with swap full, a full disk, and
  a browser and an editor running. Absolute numbers would be higher on an idle machine; the
  relative ordering is what matters.
- Part A measures framework overhead on one route without validation, authentication or database
  access — real routes add those costs on top, equally for all three.
- 3 runs per case; the spread was small for parts A and B, larger for the fsync-bound SQLite phases.

## Reproducing

Everything runs outside the repository, against the running `docker compose` stack for part B:

```bash
npm i autocannon express@4 fastify @nestjs/core @nestjs/common @nestjs/platform-express \
  reflect-metadata rxjs typescript pg better-sqlite3
curl -s http://localhost:8080/about.json > about.json      # payload served by the part A servers
npx autocannon -c 100 -d 15 http://127.0.0.1:<port>/about.json
docker run -d --rm --name bench-pg -e POSTGRES_PASSWORD=bench -p 55432:5432 postgres:16-alpine
```

The NestJS server is compiled with `tsc` (`experimentalDecorators`, `emitDecoratorMetadata`,
`module: commonjs`, no `moduleResolution`) and run with `node`. Part B uses a throwaway confirmed
account and 10 widgets, deleted afterwards.
