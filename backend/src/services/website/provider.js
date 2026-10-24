const client = require('./client');
const wikipedia = require('./wikipedia');
const rdap = require('./rdap');
const { createCache } = require('./cache');

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Each widget's data changes at a very different pace, far slower than a widget can refresh:
// see cache.js for why these sources must not be queried on every refresh.
const widgets = {
  site_overview: {
    load: (config) => client.getSiteOverview(config.url),
    cache: createCache({ ttlMs: 10 * MINUTE }),
  },
  knowledge_panel: {
    load: (config) => wikipedia.getKnowledgePanel(config.query, config.language),
    cache: createCache({ ttlMs: 6 * HOUR }),
  },
  domain_info: {
    load: (config) => rdap.getDomainInfo(config.domain),
    cache: createCache({ ttlMs: 12 * HOUR }),
  },
};

async function fetchWidgetData(widgetName, config) {
  const widget = widgets[widgetName];
  if (!widget) {
    const err = new Error(`Unknown website widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  const data = await widget.cache.getOrLoad(JSON.stringify(config), () => widget.load(config));
  return { data, fetchedAt: new Date().toISOString() };
}

// Tests need a clean slate between cases.
function clearCaches() {
  Object.values(widgets).forEach((widget) => widget.cache.clear());
}

module.exports = { fetchWidgetData, clearCaches };
