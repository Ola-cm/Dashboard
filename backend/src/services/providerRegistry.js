// Called in-process by the Timer/dashboard side to refresh a WidgetInstance — no internal
// HTTP hop, since both parts run in the same Node process.
const weatherProvider = require('./weather/provider');
const githubProvider = require('./github/provider');
const monitoringProvider = require('./monitoring/provider');
const rssProvider = require('./rss/provider');
const mapsProvider = require('./maps/provider');
const youtubeProvider = require('./youtube/provider');
const discordProvider = require('./discord/provider');
const notesProvider = require('./notes/provider');
const calendarProvider = require('./calendar/provider');
const clockProvider = require('./clock/provider');
const websiteProvider = require('./website/provider');

const providers = {
  weather: weatherProvider,
  github: githubProvider,
  monitoring: monitoringProvider,
  rss: rssProvider,
  maps: mapsProvider,
  youtube: youtubeProvider,
  discord: discordProvider,
  notes: notesProvider,
  calendar: calendarProvider,
  clock: clockProvider,
  website: websiteProvider,
};

async function fetchWidgetData(serviceName, widgetName, config, credentials) {
  const provider = providers[serviceName];
  if (!provider) {
    const err = new Error(`Unknown service "${serviceName}"`);
    err.status = 400;
    throw err;
  }
  return provider.fetchWidgetData(widgetName, config, credentials);
}

module.exports = { fetchWidgetData };
