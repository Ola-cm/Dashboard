// Domain registration data through RDAP, the structured JSON successor of WHOIS. rdap.org is a
// free, keyless bootstrap service that redirects each query to the registry responsible for the
// domain's extension (Verisign for .com, AFNIC for .fr, ...).
const axios = require('axios');
const { withRetry } = require('../httpClient');

const RDAP_URL = 'https://rdap.org/domain';
const HEADERS = { Accept: 'application/rdap+json', 'User-Agent': 'DashboardWidget/1.0' };
const DAY_MS = 24 * 60 * 60 * 1000;

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

// Accepts "github.com", "https://www.github.com/about", "docs.github.com" ...
function toHostname(input) {
  const raw = String(input || '').trim().toLowerCase();
  const host = raw.replace(/^[a-z]+:\/\//, '').split(/[/?#:]/)[0].replace(/^www\./, '');
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) {
    throw badRequest(`"${input}" is not a valid domain name`);
  }
  return host;
}

// Registration data exists for the registered domain, not for its subdomains: for
// "docs.github.com" we try that, then "github.com". Two-label names are tried last.
function candidateDomains(host) {
  const labels = host.split('.');
  const candidates = [];
  for (let i = 0; labels.length - i >= 2 && candidates.length < 3; i += 1) {
    candidates.push(labels.slice(i).join('.'));
  }
  return candidates;
}

function eventDate(data, action) {
  return data.events?.find((e) => e.eventAction === action)?.eventDate || null;
}

function registrarName(data) {
  const registrar = data.entities?.find((e) => e.roles?.includes('registrar'));
  const fn = registrar?.vcardArray?.[1]?.find((field) => field[0] === 'fn');
  return fn?.[3] || registrar?.handle || null;
}

function parseRdap(data) {
  const registeredAt = eventDate(data, 'registration');
  const expiresAt = eventDate(data, 'expiration');
  const now = Date.now();
  return {
    domain: (data.ldhName || '').toLowerCase(),
    registeredAt,
    expiresAt,
    updatedAt: eventDate(data, 'last changed'),
    ageYears: registeredAt ? Math.floor((now - Date.parse(registeredAt)) / (365.25 * DAY_MS)) : null,
    daysUntilExpiry: expiresAt ? Math.ceil((Date.parse(expiresAt) - now) / DAY_MS) : null,
    registrar: registrarName(data),
    nameservers: (data.nameservers || []).map((ns) => ns.ldhName.toLowerCase()).slice(0, 4),
    status: data.status || [],
  };
}

async function getDomainInfo(input) {
  const host = toHostname(input);
  for (const domain of candidateDomains(host)) {
    try {
      const { data } = await withRetry(() =>
        axios.get(`${RDAP_URL}/${encodeURIComponent(domain)}`, { headers: HEADERS, timeout: 10000 }),
      );
      return parseRdap(data);
    } catch (err) {
      if (err.response?.status !== 404) {
        const failure = new Error(`The registration service could not be reached for ${domain}`);
        failure.status = 424;
        throw failure;
      }
    }
  }
  // Not every extension publishes RDAP data (.eu and several country codes don't), so a 404 can
  // mean "this registry doesn't expose it" just as well as "no such domain".
  const err = new Error(
    `No public registration data for ${host} — the domain may not exist, or its extension doesn't publish RDAP data`,
  );
  err.status = 404;
  throw err;
}

module.exports = { getDomainInfo, parseRdap, candidateDomains, toHostname };
