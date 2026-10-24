// This container's outbound network occasionally drops a new connection to an external API
// (ETIMEDOUT/ENETUNREACH/ECONNRESET) even when the route is otherwise healthy. Retrying a couple
// of times clears it almost every time, so a single blip doesn't have to surface as a 500 to
// whoever's dashboard is open. Only network-level failures are retried — a real HTTP error
// response (4xx/5xx) means the request went through, so it's returned as-is.
const NETWORK_ERROR_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EAI_AGAIN',
]);

function isNetworkError(err) {
  return NETWORK_ERROR_CODES.has(err.code);
}

async function withRetry(request, retries = 2) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (err) {
      if (!isNetworkError(err) || attempt >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
}

module.exports = { withRetry };
