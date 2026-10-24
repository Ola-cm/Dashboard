jest.mock('../src/services/rss/client');

const client = require('../src/services/rss/client');
const provider = require('../src/services/rss/provider');

describe('rss provider', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches the latest articles from a feed', async () => {
    client.getLatestArticles.mockResolvedValue([
      { title: 'First post', link: 'https://example.com/1', publishedAt: '2026-09-22T00:00:00Z' },
    ]);

    const result = await provider.fetchWidgetData('article_list', {
      link: 'https://example.com/feed.xml',
      number: 5,
    });

    expect(client.getLatestArticles).toHaveBeenCalledWith('https://example.com/feed.xml', 5);
    expect(result.data).toEqual([
      { title: 'First post', link: 'https://example.com/1', publishedAt: '2026-09-22T00:00:00Z' },
    ]);
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('fetches articles matching a keyword', async () => {
    client.getArticlesByKeyword.mockResolvedValue([
      { title: 'France wins', link: 'https://example.com/2', publishedAt: '2026-09-22T00:00:00Z' },
    ]);

    const result = await provider.fetchWidgetData('keyword_filter', {
      link: 'https://example.com/feed.xml',
      keyword: 'France',
    });

    expect(client.getArticlesByKeyword).toHaveBeenCalledWith(
      'https://example.com/feed.xml',
      'France',
    );
    expect(result.data).toHaveLength(1);
  });

  it('fetches a compact feed digest', async () => {
    client.getFeedDigest.mockResolvedValue([
      { title: 'Short title', publishedAt: '2026-09-22T00:00:00Z' },
    ]);

    const result = await provider.fetchWidgetData('feed_digest', {
      link: 'https://example.com/feed.xml',
      max_length: 3,
    });

    expect(client.getFeedDigest).toHaveBeenCalledWith('https://example.com/feed.xml', 3);
    expect(result.data).toEqual([{ title: 'Short title', publishedAt: '2026-09-22T00:00:00Z' }]);
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('does_not_exist', {})).rejects.toThrow(
      /Unknown rss widget/,
    );
  });
});
