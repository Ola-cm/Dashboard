jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn(), update: jest.fn() },
  widgetInstance: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  serviceSubscription: {
    findUnique: jest.fn(),
  },
}));
jest.mock('../src/services/providerRegistry');
jest.mock('../src/services/credentialsStore');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const providerRegistry = require('../src/services/providerRegistry');
const { loadCredentials } = require('../src/services/credentialsStore');
const { jwtSecret } = require('../src/config/env');
const { registerService, resetRegistry } = require('../src/services/widgetRegistry');

const USER = { id: 'user-1', email: 'a@a.com', name: 'A', role: 'USER' };
const authHeader = `Bearer ${jwt.sign({ sub: USER.id, role: USER.role }, jwtSecret)}`;

beforeEach(() => {
  prisma.user.findUnique.mockResolvedValue(USER);
  registerService('rss', [
    {
      name: 'article_list',
      params: [
        { name: 'link', type: 'string' },
        { name: 'number', type: 'integer' },
      ],
    },
  ]);
});

afterEach(() => {
  resetRegistry();
  jest.clearAllMocks();
});

describe('dashboard widget routes', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/dashboard/widgets');
    expect(res.status).toBe(401);
  });

  it('creates and lists a widget instance for the authenticated user', async () => {
    prisma.widgetInstance.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'w1', ...data }),
    );
    prisma.widgetInstance.findMany.mockResolvedValue([{ id: 'w1', userId: USER.id }]);

    const createRes = await request(app)
      .post('/api/dashboard/widgets')
      .set('Authorization', authHeader)
      .send({
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml', number: 5 },
        refreshRate: 60,
        position: { x: 0, y: 0 },
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.widget.id).toBe('w1');

    const listRes = await request(app)
      .get('/api/dashboard/widgets')
      .set('Authorization', authHeader);
    expect(listRes.status).toBe(200);
    expect(listRes.body.widgets).toEqual([{ id: 'w1', userId: USER.id }]);
  });

  it('rejects an invalid config with 400', async () => {
    const res = await request(app)
      .post('/api/dashboard/widgets')
      .set('Authorization', authHeader)
      .send({
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml' },
        refreshRate: 60,
        position: { x: 0, y: 0 },
      });

    expect(res.status).toBe(400);
  });

  it('deletes a widget instance owned by the caller', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({ id: 'w1', userId: USER.id });

    const res = await request(app)
      .delete('/api/dashboard/widgets/w1')
      .set('Authorization', authHeader);

    expect(res.status).toBe(204);
    expect(prisma.widgetInstance.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
  });

  it("returns 404 when deleting someone else's widget instance", async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({ id: 'w1', userId: 'someone-else' });

    const res = await request(app)
      .delete('/api/dashboard/widgets/w1')
      .set('Authorization', authHeader);

    expect(res.status).toBe(404);
  });

  it('fetches live data for an owned widget instance', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({
      id: 'w1',
      userId: USER.id,
      serviceName: 'rss',
      widgetName: 'article_list',
      config: { link: 'https://example.com/feed.xml', number: 5 },
    });
    prisma.serviceSubscription.findUnique.mockResolvedValue(null);
    loadCredentials.mockResolvedValue(null);
    providerRegistry.fetchWidgetData.mockResolvedValue({ data: { items: [] }, fetchedAt: 'now' });

    const res = await request(app)
      .get('/api/dashboard/widgets/w1/data')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { items: [] }, fetchedAt: 'now' });
  });
});

describe('dashboard sharing routes', () => {
  it('reports sharing as off by default', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...USER, shareToken: null });

    const res = await request(app).get('/api/dashboard/share').set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ shareToken: null });
  });

  it('generates a share token when enabling sharing', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...USER, shareToken: null });
    prisma.user.update.mockResolvedValue({});

    const res = await request(app).post('/api/dashboard/share').set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.shareToken).toEqual(expect.any(String));
    expect(res.body.shareToken.length).toBeGreaterThan(0);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER.id },
      data: { shareToken: res.body.shareToken },
    });
  });

  it('returns the existing token instead of generating a new one when already shared', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...USER, shareToken: 'existing-token' });

    const res = await request(app).post('/api/dashboard/share').set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ shareToken: 'existing-token' });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('disables sharing', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...USER, shareToken: 'existing-token' });
    prisma.user.update.mockResolvedValue({});

    const res = await request(app).delete('/api/dashboard/share').set('Authorization', authHeader);

    expect(res.status).toBe(204);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER.id },
      data: { shareToken: null },
    });
  });
});
