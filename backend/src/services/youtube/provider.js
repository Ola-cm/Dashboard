const client = require('./client');

const handlers = {
  channel_stats: (config, credentials) =>
    client.getChannelStats(credentials.accessToken, config.channel_id),
  latest_videos: (config, credentials) =>
    client.getLatestVideos(credentials.accessToken, config.channel_id, config.count),
  top_content: (config, credentials) =>
    client.getTopContent(credentials.accessToken, config.channel_id, config.time_range),
  watch_later: (config, credentials) => client.getWatchLater(credentials.accessToken, config.count),
};

async function fetchWidgetData(widgetName, config, credentials) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown youtube widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  if (!credentials?.accessToken) {
    const err = new Error('YouTube account not linked');
    err.status = 401;
    throw err;
  }
  const data = await handler(config, credentials);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
