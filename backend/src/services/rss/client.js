// Uses rss-parser (handles RSS 2.0, Atom and RDF) rather than hand-rolling XML parsing.
const Parser = require('rss-parser');

const parser = new Parser();

async function getLatestArticles(link, number) {
  const feed = await parser.parseURL(link);
  return feed.items.slice(0, number).map((item) => ({
    title: item.title,
    link: item.link,
    publishedAt: item.isoDate || item.pubDate || null,
  }));
}

async function getArticlesByKeyword(link, keyword) {
  const feed = await parser.parseURL(link);
  const needle = keyword.toLowerCase();
  return feed.items
    .filter((item) => {
      const haystack = `${item.title || ''} ${item.contentSnippet || item.content || ''}`;
      return haystack.toLowerCase().includes(needle);
    })
    .map((item) => ({
      title: item.title,
      link: item.link,
      publishedAt: item.isoDate || item.pubDate || null,
    }));
}

// Titles + dates only, no link or content — a compact digest for a small widget, not a smaller
// article_list.
async function getFeedDigest(link, maxLength) {
  const feed = await parser.parseURL(link);
  return feed.items.slice(0, maxLength).map((item) => ({
    title: item.title,
    publishedAt: item.isoDate || item.pubDate || null,
  }));
}

module.exports = { getLatestArticles, getArticlesByKeyword, getFeedDigest };
