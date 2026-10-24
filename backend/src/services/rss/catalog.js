// Widget metadata only — feeds services/definitions/rss.js, which registers it with the widget
// registry so it shows up in GET /about.json. Fetch logic lives in provider.js.
// Matches the exact widget/param names used as the worked example in the project brief.
module.exports = [
  {
    name: 'article_list',
    description: 'Displaying the list of the last articles',
    params: [
      { name: 'link', type: 'string' },
      { name: 'number', type: 'integer' },
    ],
  },
  {
    name: 'keyword_filter',
    description: 'Only the feed items whose title or summary contains a keyword',
    params: [
      { name: 'link', type: 'string' },
      { name: 'keyword', type: 'string' },
    ],
  },
  {
    name: 'feed_digest',
    description: 'A compact digest of a feed — titles and dates only, no full content',
    params: [
      { name: 'link', type: 'string' },
      { name: 'max_length', type: 'integer' },
    ],
  },
];
