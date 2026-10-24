const request = require('supertest');
const app = require('../src/app');
const { registerService, resetRegistry } = require('../src/services/widgetRegistry');

describe('GET /about.json', () => {
  // Real service definitions (weather, github, ...) register themselves once when src/app.js
  // is first required, so each test resets to a blank registry rather than assuming an empty
  // one — otherwise it would depend on which real services happen to be wired up.
  beforeEach(() => resetRegistry());
  afterEach(() => resetRegistry());

  const articleList = {
    name: 'article_list',
    description: 'Displaying the list of the last articles',
    params: [
      { name: 'link', type: 'string' },
      { name: 'number', type: 'integer' },
    ],
  };
  const keywordFilter = {
    name: 'keyword_filter',
    description: 'Only the feed items whose title or summary contains a keyword',
    params: [
      { name: 'link', type: 'string' },
      { name: 'keyword', type: 'string' },
    ],
  };
  const feedDigest = {
    name: 'feed_digest',
    description: 'A compact digest of a feed',
    params: [
      { name: 'link', type: 'string' },
      { name: 'max_length', type: 'integer' },
    ],
  };

  it('returns client host, current time and registered services', async () => {
    registerService('rss', [articleList, keywordFilter, feedDigest]);

    const before = Math.floor(Date.now() / 1000);
    const res = await request(app).get('/about.json');
    const after = Math.floor(Date.now() / 1000);

    expect(res.status).toBe(200);
    expect(typeof res.body.client.host).toBe('string');
    expect(res.body.server.current_time).toBeGreaterThanOrEqual(before);
    expect(res.body.server.current_time).toBeLessThanOrEqual(after);
    expect(res.body.server.services).toEqual([
      { name: 'rss', widgets: [articleList, keywordFilter, feedDigest] },
    ]);
  });

  it('returns an empty services list when nothing is registered', async () => {
    const res = await request(app).get('/about.json');

    expect(res.status).toBe(200);
    expect(res.body.server.services).toEqual([]);
  });

  it('leaves out a service that has fewer than 3 widgets', async () => {
    registerService('rss', [articleList, keywordFilter, feedDigest]);
    registerService('notes', [
      {
        name: 'sticky_note',
        description: 'A short free-form note',
        params: [{ name: 'content', type: 'string' }],
      },
      {
        name: 'checklist',
        description: 'A simple checklist, one item per line',
        params: [{ name: 'items', type: 'string' }],
      },
    ]);

    const res = await request(app).get('/about.json');

    expect(res.body.server.services.map((s) => s.name)).toEqual(['rss']);
  });
});
