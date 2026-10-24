const client = require('./client');

const handlers = {
  article_list: (config) => client.getLatestArticles(config.link, config.number),
  keyword_filter: (config) => client.getArticlesByKeyword(config.link, config.keyword),
  feed_digest: (config) => client.getFeedDigest(config.link, config.max_length),
};

async function fetchWidgetData(widgetName, config) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown rss widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  const data = await handler(config);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
