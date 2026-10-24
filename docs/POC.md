# Proofs of concept — design decisions

> Different from [TECH_POC.md](./TECH_POC.md), which proves out _which tool_ to use (React vs.
> Vue, Express vs. Fastify, Postgres vs. SQLite). This document is the other kind the brief asks
> for: for a handful of Part 2 decisions where a chosen approach was not obviously going to work,
> a small proof of concept was built first to validate that the selected component or function
> behaves as expected — before other code was built on top of it. Each section names the risk,
> what was actually run to check it, and the real result.

## 1. Real SMTP delivery for account confirmation (MailHog)

**Decision under test**: send the confirmation email through a real SMTP transport
(`nodemailer`) instead of just logging the confirmation link to the console, so the flow a real
user experiences (open inbox, click link) is the one actually exercised — but without depending
on a real mailbox or real credentials for local dev and CI.

**Risk**: a fake SMTP server product might not implement the protocol closely enough for
`nodemailer`'s `secure`/STARTTLS negotiation to succeed, or its web inbox might not expose the
sent message in a way that's scriptable for testing.

**What was built and run**: [`mailer.js`](../backend/src/services/mailer.js) against the
`mailhog` service in [`docker-compose.yml`](../docker-compose.yml) (SMTP on `1025`, web UI + API
on `8025`). Validated end-to-end, not just unit-tested:

```
curl -X POST localhost:8080/api/auth/register -d '{"email":"poc@test.dev", ...}'
curl localhost:8025/api/v2/messages            # confirms the message actually arrived
# parse the confirmation link out of the JSON body, then:
curl localhost:8080/api/auth/confirm/<token>   # 200, account confirmed
curl -X POST localhost:8080/api/auth/login ... # 200, JWT issued
```

**Result**: worked on the first attempt, no protocol issues. This is the shape now behind
`register` in production use, with a documented fallback (console-logged link) if the SMTP host
is unreachable — see the "Authentication" section of
[BACKEND.md](./BACKEND.md#authentication).

## 2. Single-attribute theming for light/dark mode

**Decision under test**: drive every color in the app off CSS custom properties (`--color-*`)
redefined once under `:root[data-theme="dark"]`, wired into Tailwind via a `themedColor()` helper
in [`tailwind.config.js`](../frontend/tailwind.config.js), so flipping one `data-theme` attribute
on `<html>` re-themes ~40 already-existing files with **zero** `dark:` variants added to any of
them.

**Risk**: this only pays off if it actually covers every color in practice. Any component using a
raw Tailwind color (e.g. `bg-white`) instead of a themed token would silently break — invisible
text, invisible borders — the moment dark mode shipped, and with ~40 files involved, missing one
was plausible.

**What was built and run**: the token system in [`index.css`](../frontend/src/index.css) plus
`useTheme.js`, then every page and widget config form was screenshotted in both themes via a
scripted Playwright pass (`document.documentElement.setAttribute('data-theme', 'dark')`, screenshot
each route, diff against the light pass, and read `console` for errors).

**Result**: the sweep caught exactly the two spots the token system doesn't reach — the raw
`bg-white/60`/`border-white/80` utility classes used by every widget's config form and the add/edit
modal (hardcoded before the theme system existed). Rather than touching ~30 files, both got one
targeted override in `index.css` (`:root[data-theme='dark'] .bg-white\/60 { ... }`). Re-running the
same screenshot pass afterward showed legible text/borders everywhere, confirming the fix and that
nothing else was missed.

## 3. Remapping a provider auth failure so it doesn't trigger a global logout

**Decision under test**: when `GET /api/dashboard/widgets/:id/data` fails because the underlying
service credential is missing or invalid (e.g. a GitHub widget added before GitHub was linked),
that failure should reach the frontend as something other than a plain `401` — because the axios
interceptor in `api/client.js` treats _any_ `401` from the API as "the user's session expired" and
force-logs them out.

**Risk**: without checking this, a legitimate provider-auth error (recoverable: just link the
account) would be indistinguishable from an expired JWT (not recoverable without logging back in)
and would kick a logged-in user out of the app just for adding a widget from a service they hadn't
linked yet.

**What was built and run**: [`dashboardService.getWidgetData`](../backend/src/services/dashboardService.js#L127)
catches a provider's `401` and rewrites it to `424` (Failed Dependency) before it reaches the
controller, with a dedicated regression test:

```js
// backend/tests/dashboardService.test.js
it('remaps a 401 from the provider to 424 so the frontend does not log the user out', async () => {
  const providerError = new Error('GitHub account not linked');
  providerError.status = 401;
  providerRegistry.fetchWidgetData.mockRejectedValue(providerError);

  const rejection = await dashboardService.getWidgetData(USER_ID, 'w1').catch((err) => err);

  expect(rejection.status).toBe(424);
});
```

Followed by a real Playwright run: add a GitHub widget while GitHub isn't linked, watch the Timer's
first poll fail, and confirm the session stays alive (no redirect to `/login`).

**Result**: confirmed both ways — the unit test pins the exact status code, the browser run
confirmed the actual user-facing consequence (staying logged in) the status code exists to
prevent.
