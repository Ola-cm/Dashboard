jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../src/services/mailer');

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { sendConfirmationEmail } = require('../src/services/mailer');
const { jwtSecret } = require('../src/config/env');

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    sendConfirmationEmail.mockResolvedValue();
  });
  afterEach(() => jest.clearAllMocks());

  it('rejects an invalid email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123', name: 'A' });

    expect(res.status).toBe(400);
  });

  it('creates the account and returns 201', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: '1', ...data }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@a.com', password: 'password123', name: 'A' });

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: '1', email: 'a@a.com', name: 'A' });
  });
});

describe('GET /api/auth/confirm/:token', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 404 for an unknown token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/auth/confirm/does-not-exist');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/auth/me', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('returns the authenticated user profile', async () => {
    const user = { id: '1', email: 'a@a.com', name: 'A', role: 'USER' };
    prisma.user.findUnique.mockResolvedValue(user);
    const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(user);
  });
});

describe('DELETE /api/auth/me', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = {
      id: '1',
      email: 'a@a.com',
      name: 'A',
      role: 'USER',
      passwordHash: await bcrypt.hash('password123', 4),
    };
    prisma.user.findUnique.mockResolvedValue(user);
    token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret);
  });
  afterEach(() => jest.clearAllMocks());

  it('requires the password', async () => {
    const res = await request(app).delete('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('rejects a wrong password with 403, not 401, so the frontend does not log out', async () => {
    const res = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'wrong-password' });

    expect(res.status).toBe(403);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('refuses to delete the only admin account', async () => {
    user.role = 'ADMIN';
    prisma.user.count.mockResolvedValue(1);

    const res = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'password123' });

    expect(res.status).toBe(409);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('lets an admin delete their account when another admin remains', async () => {
    user.role = 'ADMIN';
    prisma.user.count.mockResolvedValue(2);

    const res = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'password123' });

    expect(res.status).toBe(204);
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('deletes the account with the correct password', async () => {
    const res = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'password123' });

    expect(res.status).toBe(204);
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});

describe('PATCH /api/auth/me', () => {
  let user;
  let token;
  let otherUser;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    sendConfirmationEmail.mockResolvedValue();
    user = {
      id: '1',
      email: 'a@a.com',
      name: 'A',
      role: 'USER',
      passwordHash: await bcrypt.hash('password123', 4),
    };
    otherUser = { id: '2', email: 'taken@a.com' };
    // The auth middleware looks the user up by id; the email-uniqueness check looks up by email.
    prisma.user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(where.id === user.id ? user : where.email === otherUser.email ? otherUser : null),
    );
    prisma.user.update.mockImplementation(({ data }) => Promise.resolve({ ...user, ...data }));
    token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret);
  });
  afterEach(() => jest.clearAllMocks());

  const patch = (body) =>
    request(app).patch('/api/auth/me').set('Authorization', `Bearer ${token}`).send(body);

  it('changes the name without asking for the password', async () => {
    const res = await patch({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('New Name');
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'New Name' } });
  });

  it('requires the current password to change the email', async () => {
    const res = await patch({ email: 'new@a.com' });

    expect(res.status).toBe(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects a wrong current password with 403, not 401', async () => {
    const res = await patch({ newPassword: 'another-password', currentPassword: 'wrong' });

    expect(res.status).toBe(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('refuses an email already used by another account', async () => {
    const res = await patch({ email: 'taken@a.com', currentPassword: 'password123' });

    expect(res.status).toBe(409);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('changes the email and asks to confirm the new address', async () => {
    const res = await patch({ email: 'new@a.com', currentPassword: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.emailChanged).toBe(true);
    const { data } = prisma.user.update.mock.calls[0][0];
    expect(data).toMatchObject({ email: 'new@a.com', isConfirmed: false });
    expect(data.confirmationToken).toEqual(expect.any(String));
    expect(sendConfirmationEmail).toHaveBeenCalledWith('new@a.com', data.confirmationToken);
  });

  it('changes the password to a new bcrypt hash', async () => {
    const res = await patch({ newPassword: 'another-password', currentPassword: 'password123' });

    expect(res.status).toBe(200);
    const { data } = prisma.user.update.mock.calls[0][0];
    expect(await bcrypt.compare('another-password', data.passwordHash)).toBe(true);
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a new password that is too short', async () => {
    const res = await patch({ newPassword: 'short', currentPassword: 'password123' });

    expect(res.status).toBe(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects a request that changes nothing', async () => {
    const res = await patch({ name: 'A' });

    expect(res.status).toBe(400);
  });
});
