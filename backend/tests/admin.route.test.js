jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { jwtSecret } = require('../src/config/env');

const ADMIN = { id: 'admin-1', email: 'admin@a.com', name: 'Admin', role: 'ADMIN' };
const REGULAR_USER = { id: 'user-1', email: 'a@a.com', name: 'A', role: 'USER' };
const adminHeader = `Bearer ${jwt.sign({ sub: ADMIN.id, role: ADMIN.role }, jwtSecret)}`;
const userHeader = `Bearer ${jwt.sign({ sub: REGULAR_USER.id, role: REGULAR_USER.role }, jwtSecret)}`;

afterEach(() => jest.clearAllMocks());

describe('GET /api/admin/users', () => {
  it('rejects a non-admin user with 403', async () => {
    prisma.user.findUnique.mockResolvedValue(REGULAR_USER);

    const res = await request(app).get('/api/admin/users').set('Authorization', userHeader);

    expect(res.status).toBe(403);
  });

  it('lists users for an admin', async () => {
    prisma.user.findUnique.mockResolvedValue(ADMIN);
    prisma.user.findMany.mockResolvedValue([ADMIN, REGULAR_USER]);

    const res = await request(app).get('/api/admin/users').set('Authorization', adminHeader);

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
  });
});

describe('PATCH /api/admin/users/:id', () => {
  beforeEach(() => prisma.user.findUnique.mockResolvedValue(ADMIN));

  it('rejects an admin trying to change their own role', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${ADMIN.id}`)
      .set('Authorization', adminHeader)
      .send({ role: 'USER' });

    expect(res.status).toBe(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects an invalid role value', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${REGULAR_USER.id}`)
      .set('Authorization', adminHeader)
      .send({ role: 'SUPERUSER' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for a user that does not exist', async () => {
    prisma.user.findUnique.mockImplementation(({ where: { id } }) =>
      Promise.resolve(id === ADMIN.id ? ADMIN : null),
    );

    const res = await request(app)
      .patch('/api/admin/users/does-not-exist')
      .set('Authorization', adminHeader)
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(404);
  });

  it('promotes a user to ADMIN', async () => {
    prisma.user.findUnique.mockImplementation(({ where: { id } }) =>
      Promise.resolve(id === ADMIN.id ? ADMIN : REGULAR_USER),
    );
    prisma.user.update.mockResolvedValue({ ...REGULAR_USER, role: 'ADMIN' });

    const res = await request(app)
      .patch(`/api/admin/users/${REGULAR_USER.id}`)
      .set('Authorization', adminHeader)
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
  });
});

describe('DELETE /api/admin/users/:id', () => {
  beforeEach(() => prisma.user.findUnique.mockResolvedValue(ADMIN));

  it('rejects an admin trying to delete their own account', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${ADMIN.id}`)
      .set('Authorization', adminHeader);

    expect(res.status).toBe(403);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('deletes another user', async () => {
    prisma.user.findUnique.mockImplementation(({ where: { id } }) =>
      Promise.resolve(id === ADMIN.id ? ADMIN : REGULAR_USER),
    );

    const res = await request(app)
      .delete(`/api/admin/users/${REGULAR_USER.id}`)
      .set('Authorization', adminHeader);

    expect(res.status).toBe(204);
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: REGULAR_USER.id } });
  });
});
