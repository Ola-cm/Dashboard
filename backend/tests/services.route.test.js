jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn() },
  serviceSubscription: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock('../src/services/github/oauth', () => ({
  buildAuthorizeUrl: jest.fn(() => 'https://github.com/login/oauth/authorize?mock=1'),
  verifyState: jest.fn(() => '1'),
  exchangeCodeForToken: jest.fn(() =>
    Promise.resolve({ accessToken: 'gho_mock_token', refreshToken: null, expiresAt: null }),
  ),
}));

jest.mock('../src/services/youtube/oauth', () => ({
  buildAuthorizeUrl: jest.fn(() => 'https://accounts.google.com/o/oauth2/v2/auth?mock=1'),
  verifyState: jest.fn(() => '1'),
  exchangeCodeForToken: jest.fn(() =>
    Promise.resolve({ accessToken: 'ya29.mock_token', refreshToken: '1//mock', expiresAt: null }),
  ),
}));

process.env.CREDENTIALS_ENCRYPTION_KEY = '0123456789abcdef'.repeat(4);

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const githubOauth = require('../src/services/github/oauth');
const { decryptCredentials } = require('../src/services/crypto');
const { jwtSecret } = require('../src/config/env');

function authHeader(userId = '1') {
  const token = jwt.sign({ sub: userId }, jwtSecret);
  return `Bearer ${token}`;
}

describe('services routes', () => {
  beforeEach(() => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@a.com', role: 'USER' });
  });
  afterEach(() => jest.clearAllMocks());

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(401);
  });

  it('lists the registered services with the user subscription status', async () => {
    prisma.serviceSubscription.findMany.mockResolvedValue([{ serviceName: 'weather' }]);

    const res = await request(app).get('/api/services').set('Authorization', authHeader());

    expect(res.status).toBe(200);
    const weather = res.body.services.find((s) => s.name === 'weather');
    expect(weather).toMatchObject({ requiresAuth: false, subscribed: true, available: true });
  });

  it('marks a no-auth service as available even without an explicit subscription', async () => {
    prisma.serviceSubscription.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/services').set('Authorization', authHeader());

    const weather = res.body.services.find((s) => s.name === 'weather');
    expect(weather).toMatchObject({ subscribed: false, available: true });
  });

  it('marks an auth-required service as unavailable until subscribed', async () => {
    prisma.serviceSubscription.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/services').set('Authorization', authHeader());

    const github = res.body.services.find((s) => s.name === 'github');
    expect(github).toMatchObject({ requiresAuth: true, subscribed: false, available: false });
  });

  it('subscribes to a known service', async () => {
    const res = await request(app)
      .post('/api/services/weather/subscribe')
      .set('Authorization', authHeader());

    expect(res.status).toBe(201);
    expect(prisma.serviceSubscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { userId: '1', serviceName: 'weather' },
      }),
    );
  });

  it('rejects subscribing to an unknown service', async () => {
    const res = await request(app)
      .post('/api/services/does-not-exist/subscribe')
      .set('Authorization', authHeader());

    expect(res.status).toBe(404);
  });

  it('unsubscribes from a service', async () => {
    const res = await request(app)
      .delete('/api/services/weather/subscribe')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(prisma.serviceSubscription.deleteMany).toHaveBeenCalledWith({
      where: { userId: '1', serviceName: 'weather' },
    });
  });

  it('disconnects an OAuth service by deleting its stored credentials', async () => {
    const res = await request(app)
      .delete('/api/services/github/subscribe')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(prisma.serviceSubscription.deleteMany).toHaveBeenCalledWith({
      where: { userId: '1', serviceName: 'github' },
    });
  });

  it('rejects subscribing to github directly, since it requires the OAuth flow', async () => {
    const res = await request(app)
      .post('/api/services/github/subscribe')
      .set('Authorization', authHeader());

    expect(res.status).toBe(400);
  });

  it('returns the GitHub OAuth authorize URL', async () => {
    const res = await request(app)
      .get('/api/services/github/oauth/start')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('github.com/login/oauth/authorize');
  });

  it('links the GitHub account on callback, storing encrypted credentials', async () => {
    const res = await request(app).get('/api/services/github/oauth/callback').query({
      code: 'abc',
      state: 'signed-state',
    });

    expect(githubOauth.verifyState).toHaveBeenCalledWith('signed-state');
    expect(githubOauth.exchangeCodeForToken).toHaveBeenCalledWith('abc');
    expect(prisma.serviceSubscription.upsert).toHaveBeenCalledTimes(1);
    const { create } = prisma.serviceSubscription.upsert.mock.calls[0][0];
    expect(create).toMatchObject({ userId: '1', serviceName: 'github' });
    expect(decryptCredentials(create.credentials)).toEqual({
      accessToken: 'gho_mock_token',
      refreshToken: null,
      expiresAt: null,
    });
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/services?linked=github');
  });

  it('redirects back to the frontend when the user declines the GitHub consent screen', async () => {
    const res = await request(app).get('/api/services/github/oauth/callback').query({
      error: 'access_denied',
    });

    expect(githubOauth.verifyState).not.toHaveBeenCalled();
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('error=access_denied');
  });

  it('returns the YouTube OAuth authorize URL', async () => {
    const res = await request(app)
      .get('/api/services/youtube/oauth/start')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('accounts.google.com');
  });

  it('links the YouTube account on callback, storing encrypted credentials', async () => {
    const res = await request(app).get('/api/services/youtube/oauth/callback').query({
      code: 'abc',
      state: 'signed-state',
    });

    const { create } = prisma.serviceSubscription.upsert.mock.calls[0][0];
    expect(create).toMatchObject({ userId: '1', serviceName: 'youtube' });
    expect(decryptCredentials(create.credentials)).toEqual({
      accessToken: 'ya29.mock_token',
      refreshToken: '1//mock',
      expiresAt: null,
    });
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/services?linked=youtube');
  });

  it('rejects an OAuth start request for a service with no OAuth flow', async () => {
    const res = await request(app)
      .get('/api/services/weather/oauth/start')
      .set('Authorization', authHeader());

    expect(res.status).toBe(404);
  });
});
