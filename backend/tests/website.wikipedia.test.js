jest.mock('axios');

const axios = require('axios');
const { getKnowledgePanel, toSearchTerm, formatTime } = require('../src/services/website/wikipedia');

const item = (id) => ({ type: 'wikibase-entityid', value: { id } });
const statement = (datavalue, extra = {}) => ({
  rank: 'normal',
  mainsnak: { snaktype: 'value', datavalue },
  ...extra,
});

function mockWikimedia({ claims, labels, searchPages = [{ key: 'GitHub' }], failEntity = false }) {
  axios.get.mockImplementation((url, { params } = {}) => {
    if (url.endsWith('/search/title')) return Promise.resolve({ data: { pages: searchPages } });
    if (url.includes('/page/summary/')) {
      return Promise.resolve({
        data: {
          title: 'GitHub',
          description: 'software development platform',
          extract: 'GitHub is a platform...',
          thumbnail: { source: 'https://upload.wikimedia.org/logo.png' },
          content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/GitHub' } },
          wikibase_item: 'Q364',
        },
      });
    }
    if (params?.props === 'claims') {
      if (failEntity) return Promise.reject(Object.assign(new Error('429'), { response: { status: 429 } }));
      return Promise.resolve({ data: { entities: { Q364: { claims } } } });
    }
    if (params?.props === 'labels') return Promise.resolve({ data: { entities: labels } });
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

describe('website knowledge panel', () => {
  afterEach(() => jest.resetAllMocks());

  it('turns a typed domain into a search term', () => {
    expect(toSearchTerm('https://www.github.com/about')).toBe('github');
    expect(toSearchTerm('Epitech')).toBe('Epitech');
  });

  it('formats Wikidata dates according to their precision', () => {
    expect(formatTime({ time: '+2008-02-08T00:00:00Z', precision: 11 }, 'en')).toBe('February 8, 2008');
    expect(formatTime({ time: '+1999-00-00T00:00:00Z', precision: 9 }, 'en')).toBe('1999');
  });

  it('combines the Wikipedia summary with current key facts', async () => {
    mockWikimedia({
      claims: {
        P571: [statement({ type: 'time', value: { time: '+2008-02-08T00:00:00Z', precision: 11 } })],
        P112: [statement(item('Q1')), statement(item('Q2'))],
        // A former CEO carries an "end time" qualifier and must not be shown as current.
        P169: [statement(item('Q3'), { qualifiers: { P582: [{}] } }), statement(item('Q4'))],
        P856: [statement({ type: 'string', value: 'https://github.com' })],
        P1128: [statement({ type: 'quantity', value: { amount: '+5595' } })],
      },
      labels: {
        Q1: { labels: { en: { value: 'Tom Preston-Werner' } } },
        Q2: { labels: { en: { value: 'Chris Wanstrath' } } },
        Q4: { labels: { en: { value: 'Current CEO' } } },
      },
    });

    const panel = await getKnowledgePanel('github.com', 'en');

    expect(panel).toMatchObject({
      title: 'GitHub',
      description: 'software development platform',
      imageUrl: 'https://upload.wikimedia.org/logo.png',
      pageUrl: 'https://en.wikipedia.org/wiki/GitHub',
    });
    expect(panel.facts).toEqual([
      { label: 'Founded', values: ['February 8, 2008'] },
      { label: 'Founders', values: ['Tom Preston-Werner', 'Chris Wanstrath'] },
      { label: 'CEO', values: ['Current CEO'] },
      { label: 'Employees', values: ['5,595'] },
      { label: 'Website', values: ['https://github.com'] },
    ]);
  });

  it('still returns the summary when Wikidata rate-limits the facts request', async () => {
    mockWikimedia({ claims: {}, labels: {}, failEntity: true });

    const panel = await getKnowledgePanel('GitHub', 'en');

    expect(panel.title).toBe('GitHub');
    expect(panel.facts).toEqual([]);
  });

  it('answers 404 when no article matches', async () => {
    mockWikimedia({ claims: {}, labels: {}, searchPages: [] });

    await expect(getKnowledgePanel('zzzz-nothing', 'en')).rejects.toMatchObject({ status: 404 });
  });

  it('answers 424 when Wikipedia itself is unreachable', async () => {
    axios.get.mockRejectedValue(Object.assign(new Error('down'), { response: { status: 503 } }));

    await expect(getKnowledgePanel('GitHub', 'en')).rejects.toMatchObject({ status: 424 });
  });

  it('refuses a language that is not a language code', async () => {
    await expect(getKnowledgePanel('GitHub', 'evil.com/')).rejects.toMatchObject({ status: 400 });
    expect(axios.get).not.toHaveBeenCalled();
  });
});
