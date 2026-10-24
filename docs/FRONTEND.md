# Frontend

The single-page application users interact with: accounts, the dashboard canvas and its widgets,
services, themes, profile, administration and the public shared view. It holds no business rules
of its own — every rule is enforced again by the backend ([BACKEND.md](./BACKEND.md)). How the two
talk is in [FRONTEND_BACKEND_COMMUNICATION.md](./FRONTEND_BACKEND_COMMUNICATION.md).

## Stack

| Concern      | Choice                                                   |
| ------------ | -------------------------------------------------------- |
| UI library   | React 18 (function components + hooks)                   |
| Build / dev  | Vite 5 (dev server also proxies the API)                 |
| Routing      | React Router 7                                           |
| Styling      | Tailwind CSS 3, colors driven by CSS custom properties  |
| HTTP         | axios, one shared instance                               |
| Icons        | Small inline SVG components (`components/icons.jsx`)     |

No state-management library: server data lives in the component that shows it, the session in a
React context, and the theme in a tiny module-level store.

## Folder layout

```
frontend/src/
  main.jsx               // React root: StrictMode, BrowserRouter, AuthProvider
  App.jsx                // every route, with its guard
  index.css              // theme variables, glass surfaces, wallpaper rule
  api/                   // one module per backend resource, all on the same axios instance
    client.js  auth.js  about.js  dashboard.js  services.js  admin.js  share.js
  hooks/
    useAuth.jsx          // session context: user, login, logout, updateUser
    useWidgetRefresh.js  // the Timer — one per widget card
    useConfirm.jsx       // promise-based confirmation dialog (replaces window.confirm)
    useTheme.js          // theme + custom wallpaper store
  components/
    AppShell.jsx         // floating sidebar + floating top bar around every signed-in page
    Sidebar.jsx          // navigation, theme button, user, logout
    ProtectedRoute.jsx   // signed-in users only
    AdminRoute.jsx       // admins only
    WidgetCard.jsx       // one widget instance: drag, resize, edit, delete, live data
    WidgetFormModal.jsx  // add or edit a widget (service, widget, config, size, refresh rate)
    ConfirmDialog.jsx    // modal shown before an irreversible action
    RefreshCountdown.jsx // card footer: refresh rate and seconds left before the next refresh
    icons.jsx
  pages/
    Login  Register  Confirm  Dashboard  Services  Theme  Profile  Admin  Legal  SharedDashboard
  widgets/
    registry.js          // "service:widget" -> { Display, Config }
    WidgetFrame.jsx      // shared shell of every Display (size, empty state, timestamp)
    <service>/           // one Display + one Config component per widget
```

## Routes and guards

| Route             | Access          | Page                                                     |
| ----------------- | --------------- | -------------------------------------------------------- |
| `/login`, `/register` | public      | Sign in / create an account                              |
| `/confirm/:token` | public          | Confirms an email from the link sent by the backend      |
| `/legal`          | public          | Legal notice and GDPR privacy policy                     |
| `/shared/:token`  | public          | Read-only view of a shared dashboard                     |
| `/`               | signed in       | The dashboard                                            |
| `/services`       | signed in       | Subscribe to / connect services                          |
| `/theme`          | signed in       | Pick a theme or upload a wallpaper                       |
| `/profile`        | signed in       | Account details, sharing, delete account                 |
| `/admin`          | admins          | User management                                          |

`ProtectedRoute` waits while the session is being restored, then redirects to `/login` if there is
no user. `AdminRoute` additionally sends non-admins back to `/`. These guards are only about
navigation comfort: the real protection is the backend refusing the API calls.

## Session

`AuthProvider` (`hooks/useAuth.jsx`) owns the signed-in user.

- On start-up, if a token is in `localStorage`, it calls `GET /api/auth/me` to restore the user
  (and drops the token if that fails).
- `login()` stores the JWT returned by the backend and sets the user; `logout()` removes both.
- `updateUser()` replaces the user after the Profile form saves, so the sidebar and page headers
  show the new name or email immediately.
- The axios instance (`api/client.js`) adds `Authorization: Bearer <token>` to every request, and
  on any **401** response removes the token and sends the browser to `/login`. That's why the
  backend never uses 401 for anything but an invalid session.

## The dashboard

The dashboard is a free-form canvas: each widget is absolutely positioned at its stored
`position: { x, y }` and sized from four fixed sizes (`WIDGET_SIZES` in `WidgetFrame.jsx`:
`square` 1×1, `wide` 2×1, `tall` 1×2, `large` 2×2).

- **Move** — native HTML5 drag and drop: dragging a card's header stores the pointer offset, and
  dropping computes the new position relative to the canvas. The move is applied immediately on
  screen, then saved with `PATCH /api/dashboard/widgets/:id`.
- **Resize** — a handle in the bottom-right corner, with pointer events: moving it more than
  50 px horizontally or vertically flips the width or height between 1 and 2 units, previewing
  the size live; releasing saves it.
- **Add / edit** — `WidgetFormModal` lists the services and widgets from `GET /about.json`, renders
  the chosen widget's own `Config` form, plus size and refresh rate. When editing, the widget
  itself can be swapped for any other one: values of params both widgets share (e.g. `timezone`
  from one clock to the other) are kept, going back to the original widget restores its saved
  config, and the backend re-validates everything.
- **Delete** — after a confirmation in an in-app dialog (`ConfirmDialog`, driven by `useConfirm`),
  never a native browser `confirm`/`alert` box.

### Refresh rate: the Timer

Every widget refreshes itself on its own schedule, independently of the page and of the other
widgets. This is `useWidgetRefresh(widgetId, refreshRate, configVersion)`, called by each
`WidgetCard`:

1. When the card appears, it immediately fetches `GET /api/dashboard/widgets/:id/data`, so data
   shows up without waiting a full period.
2. It then starts a `setInterval` of `refreshRate × 1000` ms that repeats the same call.
3. Each response updates only that card (`data`, `fetchedAt`, shown as "Updated hh:mm:ss" by
   `WidgetFrame`). A failure shows an error on that card only and keeps the last good data;
   the next tick simply tries again.
4. When the card disappears (widget deleted, page left), the interval is cleared and any request
   still in flight is ignored, so no state is updated on an unmounted component.
5. The effect depends on the refresh rate and on `configVersion` (the serialized config): editing
   either one restarts the timer and fetches right away, so a saved change shows up instantly
   instead of at the next tick. Changing the widget's type goes further and remounts the card (its
   React `key` includes the type), so a new display is never handed the previous widget's data.

6. `useWidgetRefresh` also returns `nextRefreshAt`, the time of the next tick. The card footer
   (`RefreshCountdown`) shows "Refreshes every Ns" and a live "next in Ns" counter. The counter
   has its own one-second state, so only that label re-renders, not the card or its display.

Between two refreshes a widget **does not move**: it shows the last response and stays frozen. No
display runs its own clock — the digital and analog clocks show the time as fetched, and
`countdown` / `days_since` compute their gap at `fetchedAt`. The only widget that runs by itself
is `timer`, because its start/pause/reset is driven by the user, not by data.

The refresh rate is chosen per widget in the add/edit form (minimum 5 seconds, enforced by the
backend too) and shown at the bottom of each card, with the countdown. The data endpoint always queries the real
third-party API, so a lower rate means fresher data *and* more calls to that API. Browsers slow
down timers in background tabs, so a hidden dashboard may refresh less often than configured and
catches up when it's visible again. The public shared view has no Timer: a visitor refreshes it
with a button.

### The widget system

`widgets/registry.js` maps `"<service>:<widget>"` — the same names the backend publishes in
`/about.json` — to a pair of components:

- **`Display`** receives `{ data, fetchedAt, size }` and renders inside `WidgetFrame`, which
  handles the aspect ratio of each size, the "No data yet" state and the timestamp.
- **`Config`** receives `{ value, onChange }` and renders the form fields for that widget's params.
  Selects with a default value push it into the config on mount, so what's shown is what's saved.

Both are purely presentational: no network calls, data and config always come in through props.
Adding a widget on the frontend is: write the two components, add one line to the registry.

## Themes and wallpaper

Every color is a CSS custom property (`--color-cream`, `--color-brown-50` … `-900`, `--color-card`,
…) holding an `R G B` triplet; `tailwind.config.js` maps each Tailwind color to
`rgb(var(--color-…) / <alpha>)`, so utilities like `bg-brown-600/10` keep working. A theme is just
another set of values for the same variables under `:root[data-theme="…"]` in `index.css` —
switching theme is setting one attribute on `<html>`, and no component knows which theme is active.

| Theme  | Look                     | Background photo                         |
| ------ | ------------------------ | ---------------------------------------- |
| light  | cream and bronze         | `dashboard-background.jpg`               |
| dark   | coffee and copper        | same photo, darker overlay               |
| spider | black web on crimson     | `spider-theme.jpg`                       |
| cherry | blush pink, cherry red   | `cherry-theme.jpg`                       |

`hooks/useTheme.js` is a small store shared through `useSyncExternalStore`, so the sidebar's theme
button and the Theme page always agree. The Theme page previews each theme and lets the user
upload their own wallpaper: the image is decoded, downscaled to at most 1920 px on its long side
and re-encoded as JPEG in a `<canvas>` (a raw phone photo would exceed the browser storage quota),
then stored as a data URL. It replaces only the photo — the chosen theme's colors and overlay still
apply on top (`:root[data-wallpaper="custom"]` rule). Theme and wallpaper are saved in the
browser's `localStorage`, per device.

## App shell

Signed-in pages are wrapped in `AppShell`: a floating sidebar and a floating top bar, both
rounded and translucent (`.floating-glass`: partial transparency, strong blur, boosted saturation,
thin top highlight — the look of iOS widgets), themed through the same variables.

Both are `position: fixed` with an invisible in-flow spacer that reserves their room. They are not
`sticky` on purpose: dashboard widgets are absolutely positioned and don't extend the page's layout
box, so a sticky element would stop following the scroll once it reached the bottom of that box.
The sidebar collapses to icons by clicking its **D Dashboard** brand; the collapsed state lives in
`AppShell` (persisted in `localStorage`) because the top bar has to follow the sidebar's width.

## Pages worth knowing

- **Services** — lists the catalog with the user's status. No-auth services get a *Subscribe*
  button; OAuth services (`requiresAuth: true`) get a *Connect* button that starts the OAuth flow,
  and, once connected, a *Connected* badge with a *Disconnect* button (`DELETE
  /api/services/:name/subscribe`, which deletes the stored tokens). The widgets of a disconnected
  service stay on the dashboard and show "account not linked" until it is connected again.
- **Profile** — account details (name freely; email or password with the current password; a new
  email must be confirmed), public sharing link, and account deletion (password required).
- **Legal** — the GDPR notice, reachable without an account and linked from the login and register
  pages. Its contact email comes from `LEGAL_CONTACT_EMAIL` at deploy time.
- **SharedDashboard** — renders a shared dashboard without the app shell or any account.

## Running it

```bash
npm run dev -w frontend     # http://localhost:5173, proxies /api to the backend
npm run build -w frontend   # production bundle in frontend/dist
```

In Docker, the frontend image contains a copy of the source (no bind mount): after changing
frontend code, rebuild the image (`docker compose build frontend`) and recreate the container,
otherwise the old code keeps being served.
