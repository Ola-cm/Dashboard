// Small in-memory TTL cache, same shape as any other short-lived lookup cache in this codebase.
// Every keystroke in the location fields can trigger a request for the same partial name (e.g.
// "Par", "Pari", "Paris"), so caching each exact query for a few minutes avoids hammering
// Open-Meteo with near-duplicate calls while someone is still typing.
function createCache({ ttlMs, maxEntries = 200 }) {
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
