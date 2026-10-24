# Services & widgets reference

The definitive list of every external service and widget built for this project — what each
widget does, its exact configurable parameters (matching `GET /about.json` verbatim), and what
each service needs to actually work. See [ARCHITECTURE.md](./ARCHITECTURE.md) for how the
registry/provider mechanism behind all of this fits together.

**11 services, 37 widgets** — comfortably above the brief's minimum of `1 + team size` services
(3, for a team of 2) and `3 × team size` widgets (6).

## Overview

| Service      | Auth              | Widgets | Works with zero config  |
| ------------ | ----------------- | ------- | ----------------------- |
| `weather`    | None              | 3       | No — needs an API key   |
| `github`     | OAuth2 (per user) | 5       | No — needs an OAuth app |
| `rss`        | None              | 3       | Yes                     |
| `monitoring` | None              | 4       | Yes                     |
| `youtube`    | OAuth2 (per user) | 4       | No — needs an OAuth app |
| `maps`       | None              | 3       | Yes                     |
| `discord`    | OAuth2 (per user) | 4       | No — needs an OAuth app |
| `notes`      | None              | 2       | Yes                     |
| `calendar`   | None              | 3       | Yes                     |
| `clock`      | None              | 3       | Yes                     |
| `website`    | None              | 3       | Yes                     |

"Needs an API key / OAuth app" is a one-time setup by whoever deploys the dashboard (values go in
`.env`, see `.env.example`) — end users never create keys themselves. For OAuth services, each end
user just clicks **Connect** on the Services page and signs in with their own account.

## Weather

No account required — available to every authenticated user by default.

| Widget                   | Params                            | Description                                       |
| ------------------------ | --------------------------------- | ------------------------------------------------- |
| `city_temperature`       | `city` (string)                   | Current temperature for a city                    |
| `sky_overview`           | `city` (string)                   | Current sky conditions (clear, clouds, rain, ...) |
| `precipitation_forecast` | `city` (string), `days` (integer) | Precipitation forecast over the next N days       |

**Backend needs**: `OPENWEATHER_API_KEY` (free tier at [openweathermap.org](https://openweathermap.org/api)).

## GitHub

Requires linking a GitHub account via OAuth2 (`Connect GitHub` on the Services page).

| Widget              | Params                             | Description                           |
| ------------------- | ---------------------------------- | ------------------------------------- |
| `recent_commits`    | `repo` (string), `count` (integer) | Latest commits on a repository        |
| `security_alerts`   | `repo` (string)                    | Open Dependabot security alerts       |
| `repo_activity`     | `repo` (string), `days` (integer)  | Commit activity over the last N days  |
| `user_repositories` | `handle` (string)                  | A user or organization's repositories |
| `repo_issues`       | `repo` (string)                    | Open issues on a repository           |

**Backend needs**: a GitHub OAuth App (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
`GITHUB_OAUTH_CALLBACK_URL`). Linked accounts' tokens are encrypted at rest
(`CREDENTIALS_ENCRYPTION_KEY`) and transparently refreshed if the App issues expiring tokens.

## RSS

No account required.

| Widget           | Params                                  | Description                                                                |
| ---------------- | --------------------------------------- | -------------------------------------------------------------------------- |
| `article_list`   | `link` (string), `number` (integer)     | Last N items from a feed — the exact worked example from the project brief |
| `keyword_filter` | `link` (string), `keyword` (string)     | Only the items whose title or summary contains a keyword                   |
| `feed_digest`    | `link` (string), `max_length` (integer) | A compact digest — titles and dates only, no link or full content          |

**Backend needs**: nothing — parses any public RSS/Atom/RDF feed URL directly. The frontend's
Feed URL field suggests a handful of well-known feeds (NASA, BBC, Le Monde, ...) via the browser's
native autocomplete, purely as a head start — any feed URL can still be typed or pasted in.

## Monitoring

No account required — this service _is_ the monitor, pinging whatever URL the widget is
configured with.

| Widget            | Params                                                          | Description                                                                  |
| ----------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `uptime_check`    | `url` (string)                                                  | Current up/down status and response time                                     |
| `response_time`   | `url` (string), `samples` (integer)                             | Average, min and max response time over several requests                     |
| `error_rate`      | `endpoint_url` (string), `time_range` (string, e.g. `1h`/`24h`) | Error rate (4xx/5xx) for an endpoint over a given time period                |
| `latency_tracker` | `endpoint_url` (string), `sample_count` (integer)               | An endpoint's response time over several requests, as a curve and last value |

**Backend needs**: nothing.

**Known limitation**: this service has no persistent store of past pings, so `error_rate`'s
`time_range` can't look back at real history — it maps to a number of live samples pinged right
now, as a live approximation of the error rate over that window.

## YouTube

Requires linking a YouTube (Google) account via OAuth2 (`Connect YouTube` on the Services page).
Every widget is authenticated with the logged-in user's own access token — including the ones
that only read public channel data, so the whole service behaves consistently (one linked
account, one token, every widget), the same way `github` does.

| Widget          | Params                                       | Description                                         |
| --------------- | -------------------------------------------- | --------------------------------------------------- |
| `channel_stats` | `channel_id` (string)                        | A channel's subscribers and total views             |
| `latest_videos` | `channel_id` (string), `count` (integer)     | Latest videos published by a channel                |
| `top_content`   | `channel_id` (string), `time_range` (string) | A channel's most viewed videos over a period        |
| `watch_later`   | `count` (integer)                            | Videos in the logged-in user's Watch Later playlist |

**Backend needs**: a Google Cloud OAuth 2.0 Client (`YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`,
`YOUTUBE_OAUTH_CALLBACK_URL`). The OAuth consent screen must be in "Testing" mode with the
account's email added as a test user, or Google refuses the login for an unverified app.

## Maps

No account required — both APIs behind it are free and key-less.

| Widget          | Params                                    | Description                                                   |
| --------------- | ----------------------------------------- | ------------------------------------------------------------- |
| `directions`    | `origin` (string), `destination` (string) | Driving distance and duration between two cities              |
| `cycling_route` | `origin` (string), `destination` (string) | Cycling distance and duration between two cities              |
| `place_lookup`  | `query` (string)                          | Geocode a city or town name to coordinates and a display name |

**Backend needs**: nothing. Geocoding runs on Open-Meteo's geocoding API, routing on OSRM's public
demo server. Both resolve **cities and towns**, not arbitrary landmarks or points of interest
(e.g. "Eiffel Tower" won't resolve — "Paris" will). Nominatim (OpenStreetMap) was tried first but
its usage policy actively blocks automated/cloud traffic — see
[TECH_POC.md](./TECH_POC.md) for the real error hit.

Every location field on this page (here and on Weather's `city` fields) suggests real place names
as the user types, via `GET /api/places/autocomplete?query=...` — the same Open-Meteo geocoding
API, asked for several matches instead of one. It's authenticated (like every other data route),
debounced client-side (300ms, 2-character minimum) and cached server-side per query for 10 minutes
so repeated keystrokes on the same partial name don't each trigger a fresh outbound call. Like
`place_lookup` itself, suggestions are advisory — the field still accepts any text typed or pasted.

## Discord

Requires linking a Discord account via OAuth2 (`Connect Discord` on the Services page).

| Widget         | Params                      | Description                                                    |
| -------------- | --------------------------- | -------------------------------------------------------------- |
| `profile`      | `avatar_size` (integer)     | The linked account's avatar, display name and username         |
| `my_servers`   | `count` (integer)           | The servers the account belongs to, with member counts         |
| `server_stats` | `guild_id` (string)         | A server's name, owner status, member count and online members |
| `channel_messages` | `channel_id` (string), `count` (integer) | The latest messages of a public channel         |

`avatar_size` accepts the sizes the Discord CDN serves (16, 32, 64, 128, 256 or 512 px; anything else
falls back to 128). `guild_id` is the server ID, found with Developer Mode enabled (right-click the
server, *Copy Server ID*); the account must be a member of that server. Member and online counts
come from `GET /users/@me/guilds?with_counts=true`, so they are approximate values.

**Messages (`channel_messages`)**: Discord exposes neither a user's notifications nor their DMs to
applications, and a user's OAuth token can't read channels. Messages are read by a **bot** of the same
application (`DISCORD_BOT_TOKEN`) that must be invited to the server, with the *Message Content*
intent enabled to receive the text (without it, content comes back empty). Since the bot sees far
more than any one user, a channel is only shown when the linked account is a member of its server
**and** `@everyone` can view it and read its history (checked from the server's roles and the
channel's permission overwrites); private channels return a 403. At most 20 messages, text cut at
300 characters, mentions and custom emojis rewritten as plain names.

**Backend needs**: a Discord application (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
`DISCORD_OAUTH_CALLBACK_URL`), Authorization Code grant (scopes `identify guilds`, `prompt=consent`
so the consent screen always shows). Linked accounts' tokens are encrypted at rest and
transparently refreshed, same as every other OAuth service here.

## Notes

No account required — the note's content _is_ the config, there's nothing to fetch.

| Widget        | Params                                                                   | Description            |
| ------------- | ------------------------------------------------------------------------ | ---------------------- |
| `sticky_note` | `title` (string), `content` (string)                                     | A short free-form note |
| `checklist`   | `title` (string), `items` (string, one item per line or comma-separated) | A simple checklist     |

**Backend needs**: nothing. With only 2 widgets, this service still works normally everywhere in
the app (Services page, dashboard widgets, ...) but is left out of `GET /about.json`, which only
advertises services with 3 or more widgets of their own.

## Calendar

No account required — both widgets are computed purely from their params.

| Widget       | Params                                                 | Description                                                                |
| ------------ | ------------------------------------------------------ | -------------------------------------------------------------------------- |
| `month_view` | `month` (integer), `year` (integer)                    | A calendar grid for a given month, today highlighted if it falls within it |
| `countdown`  | `label` (string), `target_date` (string, `YYYY-MM-DD`) | Days remaining until a target date                                         |
| `days_since` | `label` (string), `start_date` (string, `YYYY-MM-DD`)  | Days elapsed since a start date — `countdown`'s mirror image               |

**Backend needs**: nothing. `countdown` and `days_since` break the gap into days, hours, minutes
and seconds in the browser, measured at the moment of the last fetch (`fetchedAt`): like every
widget, they stay frozen until the next refresh instead of ticking on their own.

## Clock

No account required — the current time comes from timeapi.io, a free keyless API queried per timezone.

| Widget          | Params                                             | Description                                               |
| --------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `digital_clock` | `timezone` (string, IANA name e.g. `Europe/Paris`)                            | Current time in a given timezone, as digits                        |
| `analog_clock`  | `timezone` (string, IANA name)                                                | Current time in a given timezone, as an analog clock face          |
| `timer`         | `label` (string), `minutes` (integer, 0-1440), `seconds` (integer, 0-59)      | A configurable countdown timer, with start/pause/reset             |

**Backend needs**: nothing. An unrecognized timezone name returns a 400 rather than silently
falling back to UTC, and an unreachable time service a 424. Both clocks show the time as of the
last fetch and stay frozen until the next refresh: the frontend does not tick them in between,
so what they display is always what the time service last reported. The `timer` widget's duration is validated server-side (must be longer
than 0 seconds, at most 24h), but its running/paused state and countdown are entirely client-side —
the server has no notion of "started", since that changes far more often than any refresh rate
would poll for.

## Website

No account required — enter any website (or company name) and get the kind of information a
search engine shows about it.

| Widget            | Params                                                        | Description                                                                                  |
| ----------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `site_overview`   | `url` (string)                                                | What the site says about itself: name, title, description, icon, preview image, language      |
| `knowledge_panel` | `query` (string, a site or a name), `language` (string: `en`/`fr`/`es`/`de`) | Search-engine style card: Wikipedia summary plus current key facts from Wikidata (founded, founders, CEO, headquarters, country, industry, employees, website) |
| `domain_info`     | `domain` (string)                                             | Registration details from RDAP: creation date and age, expiry, registrar, name servers        |

**Backend needs**: nothing — the site itself, Wikipedia/Wikidata and the RDAP registries are free
and keyless.

**How it behaves**:

- **Security.** `site_overview` makes the server fetch a user-chosen URL, so every address it
  connects to — including redirect targets and the IPs a hostname resolves to — must be public:
  private networks, loopback, link-local and cloud-metadata addresses are refused with a 400. Pages
  are capped at 2 MB, 5 redirects and 8 seconds.
- **Caching.** These sources change rarely and some rate-limit (Wikidata answers 429 to clients
  that poll it), so results are cached server-side — 10 minutes for `site_overview`, 6 hours for
  `knowledge_panel`, 12 hours for `domain_info`. The widget keeps refreshing at its own rate; it
  just doesn't re-query the source every time. Failures are never cached.
- **Graceful degradation.** If Wikidata fails, the knowledge panel still shows the Wikipedia
  summary, without the facts.
- **Current facts only.** Wikidata keeps history (a former CEO stays listed with an end date);
  statements with an end date are skipped.
- **Typing a domain** in `knowledge_panel` works: `github.com` is searched as "github".

**Known limitations**:

- Not every domain extension publishes RDAP data: `.com`, `.org` or `.fr` work, `.eu` and several
  country codes (e.g. `.bj`) don't — the widget then explains that no public data is available.
  For a subdomain (`docs.github.com`), the registered domain (`github.com`) is looked up.
- Icons and preview images are loaded by the browser directly from the site shown, so that site
  receives the viewer's IP address (with no referrer).
- Knowledge panel facts are only as accurate and up to date as Wikidata.

## Shared building blocks

Every widget listed above is built the same way, regardless of service:

- **Backend**: `catalog.js` (metadata only, feeds `/about.json`) + `provider.js`/client file(s)
  (the actual HTTP calls) — see [ARCHITECTURE.md § The widget registry](./ARCHITECTURE.md).
- **Frontend**: a `Display` + `Config` component pair per widget, both purely presentational
  (`data`/`config` in via props, no network calls of their own), rendered through the shared
  `WidgetFrame` component for consistent shape/size (square/wide/tall/large), "no data yet" state
  and refresh timestamp.
- **OAuth services** (`github`, `youtube`, `discord`): each has its own
  `<service>/oauth.js` with the same shape — `buildAuthorizeUrl`, `verifyState`,
  `exchangeCodeForToken`, `refreshAccessToken`. Registering it in `OAUTH_PROVIDERS`
  (`services.controller.js`) is all it takes to get the generic
  `GET /api/services/:service/oauth/start` and `.../oauth/callback` routes, and to show a
  **Connect** button on the Services page. Refreshers are listed in `credentialsStore.js`.
- **Network resilience**: every external API client wraps its calls in `withRetry`
  (`services/httpClient.js`), which retries transient network failures (`ETIMEDOUT`,
  `ECONNRESET`, `ENETUNREACH`, ...) up to twice — but never a real HTTP error response, so a 401 or
  404 still surfaces immediately. `monitoring` deliberately doesn't use it: a silent retry would
  hide exactly the failures it's there to report.
