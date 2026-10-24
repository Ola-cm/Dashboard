// The "knowledge panel" — the card search engines show next to results: a short Wikipedia summary
// plus key facts (founded, founders, headquarters, ...) from Wikidata, the structured database
// behind Wikipedia. Both are free and keyless; Wikimedia asks clients to identify themselves.
const axios = require('axios');
const { withRetry } = require('../httpClient');

// Wikimedia's user-agent policy asks clients to identify themselves with a way to reach them;
// generic user agents get rate-limited much more aggressively.
const HEADERS = {
  'User-Agent':
    'DashboardWidget/1.0 (Epitech student project; https://github.com/EpitechPGE3-2026/G-WEB-500-COT-5-1-dashboard-53)',
};
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';

// Wikidata property -> label per language. Order is the display order.
const FACTS = [
  ['P571', { en: 'Founded', fr: 'Fondation', es: 'Fundación', de: 'Gründung' }],
  ['P112', { en: 'Founders', fr: 'Fondateurs', es: 'Fundadores', de: 'Gründer' }],
  ['P169', { en: 'CEO', fr: 'Directeur général', es: 'Director ejecutivo', de: 'CEO' }],
  ['P159', { en: 'Headquarters', fr: 'Siège', es: 'Sede', de: 'Hauptsitz' }],
  ['P17', { en: 'Country', fr: 'Pays', es: 'País', de: 'Land' }],
  ['P452', { en: 'Industry', fr: 'Secteur', es: 'Industria', de: 'Branche' }],
  ['P1128', { en: 'Employees', fr: 'Employés', es: 'Empleados', de: 'Mitarbeiter' }],
  ['P856', { en: 'Website', fr: 'Site web', es: 'Sitio web', de: 'Website' }],
];
const MAX_VALUES_PER_FACT = 3;

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

// A Wikipedia outage or rate limit (429) is the provider's failure, not a server error.
async function fromWikipedia(request) {
  try {
    return await withRetry(request);
  } catch (err) {
    if (err.response?.status === 404) throw notFound('No Wikipedia article found');
    const failure = new Error('Wikipedia could not be reached, try again later');
    failure.status = 424;
    throw failure;
  }
}

function assertLanguage(language) {
  if (!/^[a-z]{2,3}$/.test(language || '')) {
    const err = new Error('language must be a Wikipedia language code such as "en" or "fr"');
    err.status = 400;
    throw err;
  }
}

// "https://www.github.com/about" -> "github": people often type a site rather than a name.
function toSearchTerm(query) {
  const trimmed = String(query || '').trim();
  const looksLikeDomain = /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(trimmed);
  if (!looksLikeDomain) return trimmed;
  const host = trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
  return host.split('.').slice(0, -1).join(' ');
}

// Wikidata keeps history: a former CEO or headquarters stays listed, with an "end time" (P582)
// qualifier. Those are dropped so the panel only shows what is true today.
function preferredStatements(claims = []) {
  const usable = claims.filter(
    (c) => c.rank !== 'deprecated' && c.mainsnak?.snaktype === 'value' && !c.qualifiers?.P582,
  );
  const preferred = usable.filter((c) => c.rank === 'preferred');
  return (preferred.length ? preferred : usable).slice(0, MAX_VALUES_PER_FACT);
}

function formatTime({ time, precision }, language) {
  const [, year, month, day] = time.match(/^[+-](\d+)-(\d\d)-(\d\d)/) || [];
  if (!year) return null;
  if (precision >= 11) {
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  if (precision === 10) {
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    });
  }
  return String(Number(year));
}

// Turns an entity's claims into [{ label, values }], resolving referenced items to their names.
async function extractFacts(claims, language) {
  const pending = FACTS.map(([property, labels]) => ({
    label: labels[language] || labels.en,
    values: preferredStatements(claims[property]).map((c) => c.mainsnak.datavalue),
  })).filter((fact) => fact.values.length > 0);

  const itemIds = [
    ...new Set(
      pending.flatMap((f) => f.values.filter((v) => v.type === 'wikibase-entityid').map((v) => v.value.id)),
    ),
  ];
  let names = {};
  if (itemIds.length) {
    const { data } = await withRetry(() =>
      axios.get(WIKIDATA_API, {
        headers: HEADERS,
        params: {
          action: 'wbgetentities',
          ids: itemIds.join('|'),
          props: 'labels',
          languages: `${language}|en`,
          format: 'json',
        },
      }),
    );
    names = Object.fromEntries(
      Object.entries(data.entities || {}).map(([id, entity]) => [
        id,
        entity.labels?.[language]?.value || entity.labels?.en?.value || null,
      ]),
    );
  }

  return pending
    .map(({ label, values }) => ({
      label,
      values: values
        .map((v) => {
          if (v.type === 'wikibase-entityid') return names[v.value.id];
          if (v.type === 'time') return formatTime(v.value, language);
          if (v.type === 'quantity') return Number(v.value.amount).toLocaleString(language);
          if (v.type === 'string') return v.value;
          return null;
        })
        .filter(Boolean),
    }))
    .filter((fact) => fact.values.length > 0);
}

async function getKnowledgePanel(query, language) {
  assertLanguage(language);
  const term = toSearchTerm(query);
  const base = `https://${language}.wikipedia.org`;

  const { data: search } = await fromWikipedia(() =>
    axios.get(`${base}/w/rest.php/v1/search/title`, {
      headers: HEADERS,
      params: { q: term, limit: 1 },
    }),
  );
  const page = search.pages?.[0];
  if (!page) {
    throw notFound(`No Wikipedia article found for "${term}"`);
  }

  const { data: summary } = await fromWikipedia(() =>
    axios.get(`${base}/api/rest_v1/page/summary/${encodeURIComponent(page.key)}`, {
      headers: HEADERS,
    }),
  );

  // The key facts are a bonus on top of the summary: if Wikidata is down or rate-limits us, the
  // panel still shows the Wikipedia part instead of failing entirely.
  let facts = [];
  if (summary.wikibase_item) {
    try {
      const { data: entity } = await withRetry(() =>
        axios.get(WIKIDATA_API, {
          headers: HEADERS,
          params: {
            action: 'wbgetentities',
            ids: summary.wikibase_item,
            props: 'claims',
            format: 'json',
          },
        }),
      );
      facts = await extractFacts(entity.entities?.[summary.wikibase_item]?.claims || {}, language);
    } catch {
      facts = [];
    }
  }

  return {
    title: summary.title,
    description: summary.description || null,
    extract: summary.extract || null,
    imageUrl: summary.thumbnail?.source || null,
    pageUrl: summary.content_urls?.desktop?.page || `${base}/wiki/${encodeURIComponent(page.key)}`,
    facts,
  };
}

module.exports = { getKnowledgePanel, toSearchTerm, extractFacts, formatTime };
