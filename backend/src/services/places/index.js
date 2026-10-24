const { searchPlaces } = require('./client');
const { createCache } = require('./cache');

const MIN_QUERY_LENGTH = 2;
const cache = createCache({ ttlMs: 10 * 60 * 1000 });

// Below MIN_QUERY_LENGTH there's no point calling out — Open-Meteo returns noisy, broad matches
// for a single letter, and this is a field a user is actively typing into on every keystroke.
async function autocomplete(query) {
  const trimmed = (query || '').trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return [];
  }
  return cache.getOrLoad(trimmed.toLowerCase(), () => searchPlaces(trimmed));
}

module.exports = { autocomplete, clearCache: cache.clear };
