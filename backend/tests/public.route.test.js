jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn() },
  widgetInstance: { findMany: jest.fn() },
  serviceSubscription: { findUnique: jest.fn() },
}));
jest.mock('../src/services/providerRegistry');
jest.mock('../src/services/credentialsStore');

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const providerRegistry = require('../src/services/providerRegistry');
const { loadCredentials } = require('../src/services/credentialsStore');
const { registerService, resetRegistry } = require('../src/services/widgetRegistry');

const OWNER = { id: 'user-1', name: 'Olaife', shareToken: 'the-token' };

beforeEach(() => {
  registerService('rss', [{ name: 'article_list', params: [{ name: 'link', type: 'string' }] }]);
});

afterEach(() => {
  resetRegistry();
  jest.clearAllMocks();
});

describe('GET /api/public/dashboards/:token', () => {
  it('returns 404 for an unknown token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/public/dashboards/does-not-exist');

    expect(res.status).toBe(404);
  });

  it('does not require authentication', async () => {
    prisma.user.findUnique.mockResolvedValue(OWNER);
    prisma.widgetInstance.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/public/dashboards/the-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ owner: { name: 'Olaife' }, widgets: [] });
  });

  it('fetches live data for every widget on the shared dashboard', async () => {
    prisma.user.findUnique.mockResolvedValue(OWNER);
    prisma.widgetInstance.findMany.mockResolvedValue([
      {
        id: 'w1',
        userId: OWNER.id,
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml' },
        size: 'wide',
        position: { x: 0, y: 0 },
      },
    ]);
    prisma.serviceSubscription.findUnique.mockResolvedValue(null);
    loadCredentials.mockResolvedValue(null);
    providerRegistry.fetchWidgetData.mockResolvedValue({ data: { items: [] }, fetchedAt: 'now' });

    const res = await request(app).get('/api/public/dashboards/the-token');

    expect(res.status).toBe(200);
    expect(res.body.widgets).toEqual([
      {
        id: 'w1',
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml' },
        size: 'wide',
        position: { x: 0, y: 0 },
        data: { items: [] },
        fetchedAt: 'now',
        error: null,
      },
    ]);
  });

  it("reports a widget's own error without failing the rest of the shared dashboard", async () => {
    prisma.user.findUnique.mockResolvedValue(OWNER);
    prisma.widgetInstance.findMany.mockResolvedValue([
      {
        id: 'w1',
        userId: OWNER.id,
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml' },
        size: 'wide',
        position: { x: 0, y: 0 },
      },
    ]);
    prisma.serviceSubscription.findUnique.mockResolvedValue(null);
    loadCredentials.mockResolvedValue(null);
    providerRegistry.fetchWidgetData.mockRejectedValue(new Error('feed unreachable'));

    const res = await request(app).get('/api/public/dashboards/the-token');

    expect(res.status).toBe(200);
    expect(res.body.widgets[0].data).toBeNull();
    expect(res.body.widgets[0].error).toBe('feed unreachable');
  });
});
