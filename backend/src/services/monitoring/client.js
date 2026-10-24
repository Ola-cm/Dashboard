// No third-party API: this service is the monitor — it pings whatever URL the widget is
// configured with and reports what actually happened.
const axios = require('axios');

async function pingOnce(url) {
  const start = Date.now();
  try {
    const res = await axios.get(url, { timeout: 5000, validateStatus: () => true });
    return { up: res.status < 500, statusCode: res.status, responseTimeMs: Date.now() - start };
  } catch (err) {
    return {
      up: false,
      statusCode: null,
      responseTimeMs: Date.now() - start,
      error: err.code || err.message,
    };
  }
}

async function getUptimeStatus(url) {
  const result = await pingOnce(url);
  return { url, ...result };
}

async function getResponseTimeStats(url, samples) {
  const results = [];
  for (let i = 0; i < samples; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- samples must be sequential, not fired at once
    results.push(await pingOnce(url));
  }
  const times = results.map((r) => r.responseTimeMs);
  return {
    url,
    samples: results.length,
    upCount: results.filter((r) => r.up).length,
    avgMs: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    minMs: Math.min(...times),
    maxMs: Math.max(...times),
  };
}

// This service has no persistent store of past pings — it only ever pings live (see the note at
// the top of this file) — so `timeRange` can't look back at real history. It maps to how many
// live samples get pinged right now, as a live approximation of the error rate over that window.
const TIME_RANGE_TO_SAMPLES = { '1h': 6, '24h': 12 };

async function getErrorRate(url, timeRange) {
  const sampleCount = TIME_RANGE_TO_SAMPLES[timeRange] || TIME_RANGE_TO_SAMPLES['1h'];
  const results = [];
  for (let i = 0; i < sampleCount; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- samples must be sequential, not fired at once
    results.push(await pingOnce(url));
  }
  // A 4xx/5xx response and a connection failure both count as an error here — "up" (used by
  // uptime_check) is more lenient and only treats 5xx as down.
  const errorCount = results.filter((r) => r.statusCode === null || r.statusCode >= 400).length;
  return {
    url,
    timeRange,
    samples: results.length,
    errorCount,
    errorRatePercent: Math.round((errorCount / results.length) * 1000) / 10,
  };
}

async function getLatencyTrend(url, sampleCount) {
  const results = [];
  for (let i = 0; i < sampleCount; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- samples must be sequential, not fired at once
    results.push(await pingOnce(url));
  }
  const samples = results.map((r, index) => ({ index, responseTimeMs: r.responseTimeMs }));
  return {
    url,
    samples,
    lastMs: samples[samples.length - 1]?.responseTimeMs ?? null,
  };
}

module.exports = { getUptimeStatus, getResponseTimeStats, getErrorRate, getLatencyTrend };
