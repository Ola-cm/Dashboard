const client = require('./client');

const handlers = {
  uptime_check: (config) => client.getUptimeStatus(config.url),
  response_time: (config) => client.getResponseTimeStats(config.url, config.samples),
  error_rate: (config) => client.getErrorRate(config.endpoint_url, config.time_range),
  latency_tracker: (config) => client.getLatencyTrend(config.endpoint_url, config.sample_count),
};

async function fetchWidgetData(widgetName, config) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown monitoring widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  const data = await handler(config);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
