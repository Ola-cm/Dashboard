const axios = require('axios');
const { withRetry } = require('../httpClient');
const { normalizeUrl, assertPublicUrl, guardedLookup } = require('./publicUrl');
const { parsePageMeta } = require('./pageMeta');

const USER_AGENT = 'Mozilla/5.0 (compatible; DashboardSiteInfo/1.0)';
const MAX_PAGE_BYTES = 2 * 1024 * 1024;

function failedDependency(message) {
  const err = new Error(message);
  err.status = 424;
  return err;
}

async function fetchPage(url) {
  try {
    return await withRetry(() =>
      axios.get(url.toString(), {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
        responseType: 'text',
        timeout: 8000,
        maxRedirects: 5,
        maxContentLength: MAX_PAGE_BYTES,
        lookup: guardedLookup,
        // Redirect targets that are IP literals skip DNS, so they're checked here as well.
        beforeRedirect: (options) => assertPublicUrl(new URL(options.href)),
        validateStatus: () => true,
      }),
    );
  } catch (err) {
    // The private-address guard throws inside the HTTP client, which wraps it — once for a direct
    // request, twice when it fires on a redirect. Walk the cause chain to surface its 400.
    for (let e = err; e; e = e.cause) {
      if (e.status === 400) throw e;
    }
    throw failedDependency(`Could not reach ${url.hostname}`);
  }
}

async function getSiteOverview(input) {
  const url = normalizeUrl(input);
  assertPublicUrl(url);

  const response = await fetchPage(url);
  const finalUrl = response.request?.res?.responseUrl || url.toString();
  const contentType = String(response.headers['content-type'] || '');
  const meta = contentType.includes('html') ? parsePageMeta(response.data, finalUrl) : {};
  const { hostname } = new URL(finalUrl);

  return {
    url: finalUrl,
    domain: hostname.replace(/^www\./, ''),
    status: response.status,
    siteName: meta.siteName || null,
    title: meta.title || null,
    description: meta.description || null,
    imageUrl: meta.imageUrl || null,
    iconUrl: meta.iconUrl || new URL('/favicon.ico', finalUrl).toString(),
    language: meta.language || null,
  };
}

module.exports = { getSiteOverview };
