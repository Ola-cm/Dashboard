jest.mock('../src/services/website/client');
jest.mock('../src/services/website/wikipedia');
jest.mock('../src/services/website/rdap');

const client = require('../src/services/website/client');
const wikipedia = require('../src/services/website/wikipedia');
const rdap = require('../src/services/website/rdap');
const provider = require('../src/services/website/provider');

describe('website provider', () => {
  afterEach(() => {
    jest.resetAllMocks();
    provider.clearCaches();
  });

  it('fetches a site overview from its URL', async () => {
    client.getSiteOverview.mockResolvedValue({ domain: 'github.com', title: 'GitHub' });

    const result = await provider.fetchWidgetData('site_overview', { url: 'github.com' });

    expect(client.getSiteOverview).toHaveBeenCalledWith('github.com');
    expect(result.data.title).toBe('GitHub');
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('builds a knowledge panel for a query in a language', async () => {
    wikipedia.getKnowledgePanel.mockResolvedValue({ title: 'GitHub', facts: [] });

    await provider.fetchWidgetData('knowledge_panel', { query: 'GitHub', language: 'fr' });

    expect(wikipedia.getKnowledgePanel).toHaveBeenCalledWith('GitHub', 'fr');
  });

  it('looks up domain registration data', async () => {
    rdap.getDomainInfo.mockResolvedValue({ domain: 'github.com' });

    await provider.fetchWidgetData('domain_info', { domain: 'github.com' });

    expect(rdap.getDomainInfo).toHaveBeenCalledWith('github.com');
  });

  it('serves repeated refreshes from the cache instead of re-querying the source', async () => {
    wikipedia.getKnowledgePanel.mockResolvedValue({ title: 'GitHub', facts: [] });
    const config = { query: 'GitHub', language: 'en' };

    await provider.fetchWidgetData('knowledge_panel', config);
    const second = await provider.fetchWidgetData('knowledge_panel', config);

    expect(wikipedia.getKnowledgePanel).toHaveBeenCalledTimes(1);
    expect(second.data.title).toBe('GitHub');
  });

  it('keys the cache on the config, so different queries are fetched separately', async () => {
    wikipedia.getKnowledgePanel.mockResolvedValue({ title: 'x', facts: [] });

    await provider.fetchWidgetData('knowledge_panel', { query: 'GitHub', language: 'en' });
    await provider.fetchWidgetData('knowledge_panel', { query: 'GitHub', language: 'fr' });

    expect(wikipedia.getKnowledgePanel).toHaveBeenCalledTimes(2);
  });

  it('never caches a failure', async () => {
    rdap.getDomainInfo
      .mockRejectedValueOnce(Object.assign(new Error('down'), { status: 424 }))
      .mockResolvedValueOnce({ domain: 'github.com' });

    await expect(provider.fetchWidgetData('domain_info', { domain: 'github.com' })).rejects.toMatchObject({
      status: 424,
    });
    const retry = await provider.fetchWidgetData('domain_info', { domain: 'github.com' });

    expect(retry.data.domain).toBe('github.com');
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('screenshot', { url: 'https://example.com' })).rejects.toThrow(
      /Unknown website widget/,
    );
  });
});
