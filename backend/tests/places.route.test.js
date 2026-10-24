jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn() },
}));
jest.mock('../src/services/places/client');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const client = require('../src/services/places/client');
const places = require('../src/services/places');
const { jwtSecret } = require('../src/config/env');

const USER = { id: 'user-1', email: 'a@a.com', name: 'A', role: 'USER' };
const authHeader = `Bearer ${jwt.sign({ sub: USER.id, role: USER.role }, jwtSecret)}`;

beforeEach(() => prisma.user.findUnique.mockResolvedValue(USER));
afterEach(() => {
  jest.clearAllMocks();
  places.clearCache();
});

describe('GET /api/places/autocomplete', () => {
  it('rejects a request with no auth token', async () => {
    const res = await request(app).get('/api/places/autocomplete').query({ query: 'Paris' });

    expect(res.status).toBe(401);
  });

  it('returns place suggestions for an authenticated user', async () => {
    client.searchPlaces.mockResolvedValue([{ label: 'Paris, France', lat: 48.85, lon: 2.35 }]);

    const res = await request(app)
      .get('/api/places/autocomplete')
      .query({ query: 'Paris' })
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.suggestions).toEqual([{ label: 'Paris, France', lat: 48.85, lon: 2.35 }]);
  });

  it('returns an empty list without calling out for a too-short query', async () => {
    const res = await request(app)
      .get('/api/places/autocomplete')
      .query({ query: 'p' })
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.suggestions).toEqual([]);
    expect(client.searchPlaces).not.toHaveBeenCalled();
  });
});
