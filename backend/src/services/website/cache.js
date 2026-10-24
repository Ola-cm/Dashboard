// Small in-memory TTL cache. The website widgets read sources that change rarely (a Wikipedia
// summary, a domain's registration date) but are polled at each widget's refresh rate — as often as
// every 5 seconds. Without a cache that would hammer Wikimedia and the RDAP registries, which
// rate-limit (HTTP 429) and would then break the widgets. Entries are per process and lost on
// restart, which is fine: they're only a shortcut to data that can always be fetched again.
function createCache({ ttlMs, maxEntries = 500 }) {
  const entries = new Map();

  return {
    async getOrLoad(key, load) {
      const hit = entries.get(key);
      if (hit && hit.expiresAt > Date.now()) {
        return hit.value;
      }
      const value = await load();
      entries.delete(key);
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      // Map keeps insertion order, so the first key is the oldest one.
      if (entries.size > maxEntries) {
        entries.delete(entries.keys().next().value);
      }
      return value;
    },
    clear() {
      entries.clear();
    },
  };
}

module.exports = { createCache };
