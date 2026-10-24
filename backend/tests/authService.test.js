jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('../src/config/env', () => ({
  ...jest.requireActual('../src/config/env'),
  adminEmails: ['admin@a.com'],
}));
jest.mock('../src/services/mailer');

const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');
const { sendConfirmationEmail } = require('../src/services/mailer');
const authService = require('../src/services/authService');

describe('authService.register', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    sendConfirmationEmail.mockResolvedValue();
  });
  afterEach(() => jest.clearAllMocks());

  it('sends a confirmation email with the generated token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: '1', ...data }));

    await authService.register({ email: 'a@a.com', password: 'password123', name: 'A' });

    const token = prisma.user.create.mock.calls[0][0].data.confirmationToken;
    expect(sendConfirmationEmail).toHaveBeenCalledWith('a@a.com', token);
  });

  it('still creates the account if sending the confirmation email fails', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: '1', ...data }));
    sendConfirmationEmail.mockRejectedValue(new Error('SMTP unreachable'));

    const user = await authService.register({
      email: 'a@a.com',
      password: 'password123',
      name: 'A',
    });

    expect(user).toEqual({ id: '1', email: 'a@a.com', name: 'A' });
  });

  it('rejects a password shorter than 8 characters', async () => {
    await expect(
      authService.register({ email: 'a@a.com', password: 'short', name: 'A' }),
    ).rejects.toThrow(/at least 8 characters/);
  });

  it('rejects a duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1' });

    await expect(
      authService.register({ email: 'a@a.com', password: 'password123', name: 'A' }),
    ).rejects.toThrow(/already exists/);
  });

  it('creates a user with a hashed password and a confirmation token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: '1', ...data }));

    const user = await authService.register({
      email: 'a@a.com',
      password: 'password123',
      name: 'A',
    });

    expect(user).toEqual({ id: '1', email: 'a@a.com', name: 'A' });
    const createArgs = prisma.user.create.mock.calls[0][0].data;
    expect(createArgs.passwordHash).not.toBe('password123');
    expect(await bcrypt.compare('password123', createArgs.passwordHash)).toBe(true);
    expect(createArgs.confirmationToken).toHaveLength(64);
  });

  it('promotes an email listed in ADMIN_EMAILS to the ADMIN role', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: '1', ...data }));

    await authService.register({ email: 'admin@a.com', password: 'password123', name: 'Admin' });

    expect(prisma.user.create.mock.calls[0][0].data.role).toBe('ADMIN');
  });

  it('leaves a regular email as the default USER role', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: '1', ...data }));

    await authService.register({ email: 'a@a.com', password: 'password123', name: 'A' });

    expect(prisma.user.create.mock.calls[0][0].data.role).toBe('USER');
  });
});

describe('authService.confirm', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects an unknown token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.confirm('bad-token')).rejects.toThrow(/Invalid or expired/);
  });

  it('marks the matching user as confirmed and clears the token', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', confirmationToken: 'tok' });

    await authService.confirm('tok');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { isConfirmed: true, confirmationToken: null },
    });
  });
});

describe('authService.login', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects an unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.login({ email: 'x@x.com', password: 'password123' })).rejects.toThrow(
      /Invalid email or password/,
    );
  });

  it('rejects the wrong password', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    prisma.user.findUnique.mockResolvedValue({ id: '1', passwordHash, isConfirmed: true });

    await expect(authService.login({ email: 'a@a.com', password: 'wrong' })).rejects.toThrow(
      /Invalid email or password/,
    );
  });

  it('rejects an unconfirmed account even with the right password', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'a@a.com',
      passwordHash,
      isConfirmed: false,
      role: 'USER',
    });

    await expect(authService.login({ email: 'a@a.com', password: 'password123' })).rejects.toThrow(
      /confirm your email/,
    );
  });

  it('returns a JWT and public profile for a confirmed user with the right password', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'a@a.com',
      name: 'A',
      passwordHash,
      isConfirmed: true,
      role: 'USER',
    });

    const result = await authService.login({ email: 'a@a.com', password: 'password123' });

    expect(typeof result.token).toBe('string');
    expect(result.user).toEqual({ id: '1', email: 'a@a.com', name: 'A', role: 'USER' });
  });
});
