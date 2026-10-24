import { Link } from 'react-router-dom';

// Set by whoever deploys the dashboard (LEGAL_CONTACT_EMAIL in .env) — the person answering
// GDPR requests depends on the deployment, so it can't be hardcoded here.
const CONTACT_EMAIL = import.meta.env.VITE_LEGAL_CONTACT_EMAIL;
const LAST_UPDATED = '29 September 2026';

// Every statement below describes what the code actually does — keep it in sync when a service,
// a stored field or a third party is added.
const THIRD_PARTIES_SERVER = [
  ['OpenWeatherMap', 'the city names of your weather widgets'],
  ['GitHub', 'your GitHub access token and the repositories/handles you configure'],
  ['Google (YouTube)', 'your YouTube access token and the channel IDs you configure'],
  [
    'Discord',
    'your Discord access token, the server and channel IDs you configure; the bot reads the latest messages of the public channels you display',
  ],
  ['Open-Meteo and OSRM', 'the place names of your maps widgets'],
  ['Wikipedia and Wikidata (Wikimedia)', 'the name you look up in a knowledge panel widget'],
  ['RDAP registries (through rdap.org)', 'the domain name of your domain info widgets'],
  [
    'Any RSS feed, URL or website you configure',
    'a plain request to that address (RSS, monitoring, website overview)',
  ],
];

const THIRD_PARTIES_BROWSER = [
  ['Google Fonts', 'loads the fonts of the interface'],
  ['The websites shown by the website overview widget', 'serve its icon and preview image'],
  ['Wikimedia', 'serves the images of the knowledge panel widget'],
  ['Discord', 'serves the avatar and server icons of the Discord widgets'],
];

const STORAGE_KEYS = [
  ['token', 'keeps you logged in — removed when you log out'],
  ['dashboard-theme', 'your color theme'],
  ['dashboard-wallpaper', 'your custom wallpaper, if you uploaded one'],
  ['dashboard-sidebar-collapsed', 'whether the sidebar is collapsed'],
];

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold text-brown-800">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-brown-600">{children}</div>
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map(([name, detail]) => (
        <li key={name}>
          <span className="font-medium text-brown-800">{name}</span> — {detail}
        </li>
      ))}
    </ul>
  );
}

export default function Legal() {
  const contact = CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brown-800 underline">
      {CONTACT_EMAIL}
    </a>
  ) : (
    'the administrator of this dashboard instance'
  );

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-medium text-brown-600 hover:text-brown-500">
          &larr; Back to the app
        </Link>

        <article className="glass mt-4 space-y-8 rounded-2xl p-5 shadow-xl sm:p-8 shadow-brown-900/10">
          <header>
            <h1 className="font-display text-2xl font-semibold text-brown-800">
              Legal notice &amp; privacy policy
            </h1>
            <p className="mt-1 text-sm text-brown-400">
              GDPR (EU Regulation 2016/679) · Last updated {LAST_UPDATED}
            </p>
          </header>

          <Section title="Publisher">
            <p>
              Dashboard is a student project built at Epitech (module G-WEB-500) by ALAO Olaife and
              DEGNON Kimberly. It is self-hosted: whoever deploys an instance of it hosts it and
              acts as the data controller for that instance.
            </p>
            <p>Contact for any question or privacy request: {contact}.</p>
          </Section>

          <Section title="What we collect">
            <List
              items={[
                ['Your account', 'name, email address, role, whether the account is confirmed'],
                [
                  'Your password',
                  'never stored as such — only a one-way bcrypt hash that cannot be reversed',
                ],
                [
                  'Your dashboard',
                  "the widgets you add and what you type into their settings (a city, a repository, a note's text, a URL, ...), plus their size and position",
                ],
                [
                  'Linked accounts',
                  'the access tokens of the services you connect (GitHub, YouTube, Discord), encrypted at rest with AES-256-GCM',
                ],
                [
                  'Technical tokens',
                  'an email confirmation token (deleted once your account is confirmed) and, only if you turn sharing on, a public share link token',
                ],
              ]}
            />
            <p>
              We do <span className="font-medium text-brown-800">not</span> log IP addresses, use
              analytics or advertising trackers, set cookies, or sell or share your data for any
              other purpose.
            </p>
          </Section>

          <Section title="Why, and on what legal basis">
            <p>
              Your data is used only to provide the dashboard you ask for: your account, your
              widgets and the services you link (performance of the service — GDPR art. 6(1)(b)),
              and to keep the service secure (legitimate interest — art. 6(1)(f)). Your email is
              only used to confirm your account.
            </p>
          </Section>

          <Section title="Who receives it">
            <p>
              To show a widget, the server queries the corresponding service on your behalf and
              sends it only what that widget needs:
            </p>
            <List items={THIRD_PARTIES_SERVER} />
            <p>
              Some content is loaded directly by your browser, which therefore shares your IP
              address with these providers:
            </p>
            <List items={THIRD_PARTIES_BROWSER} />
            <p>
              The confirmation email goes through the email provider configured by the deployer.
              Each of these providers applies its own privacy policy.
            </p>
          </Section>

          <Section title="How long we keep it">
            <p>
              As long as your account exists. Deleting your account from the Profile page erases it
              immediately, together with your dashboard, your widgets and your linked accounts&apos;
              tokens. If you turn dashboard sharing on, anyone with the link can view your widgets
              until you turn it off.
            </p>
          </Section>

          <Section title="Data stored in your browser">
            <p>
              The app stores a few values in your browser&apos;s local storage. They are needed for
              the app to work or only remember your preferences, stay on your device, and are never
              used for tracking — which is why no consent banner is needed:
            </p>
            <List items={STORAGE_KEYS} />
          </Section>

          <Section title="Your rights">
            <p>
              Under the GDPR you can access, correct, delete or export your data, and restrict or
              object to its processing. You can correct your details and delete your account
              yourself from the Profile page; for anything else, contact {contact}. You can also
              lodge a complaint with your data protection authority (for example the CNIL in France
              or the APDP in Benin).
            </p>
          </Section>

          <Section title="Security">
            <p>
              Passwords are hashed with bcrypt, linked accounts&apos; tokens are encrypted at rest,
              and sessions use signed tokens that expire. Encryption in transit (HTTPS) depends on
              how the instance is deployed.
            </p>
          </Section>
        </article>
      </div>
    </div>
  );
}
