const client = require('./client');

const handlers = {
  directions: (config) => client.getDirections(config.origin, config.destination),
  cycling_route: (config) => client.getCyclingRoute(config.origin, config.destination),
  place_lookup: (config) => client.getPlace(config.query),
};

async function fetchWidgetData(widgetName, config) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown maps widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  const data = await handler(config);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
