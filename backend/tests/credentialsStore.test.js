jest.mock('../src/config/env', () => ({
  credentialsEncryptionKey: '0123456789abcdef'.repeat(4),
}));

jest.mock('../src/config/prisma', () => ({
  serviceSubscription: { update: jest.fn() },
}));

jest.mock('../src/services/github/oauth', () => ({
  refreshAccessToken: jest.fn(),
}));

const prisma = require('../src/config/prisma');
const githubOauth = require('../src/services/github/oauth');
const { encryptCredentials } = require('../src/services/crypto');
const { loadCredentials } = require('../src/services/credentialsStore');

describe('credentialsStore.loadCredentials', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns null when nothing is stored', async () => {
    expect(await loadCredentials({ credentials: null })).toBeNull();
  });

  it('decrypts stored credentials without refreshing when there is no expiry', async () => {
    const credentials = { accessToken: 'gho_abc', refreshToken: null, expiresAt: null };
    const subscription = {
      id: '1',
      serviceName: 'github',
      credentials: encryptCredentials(credentials),
    };

    const result = await loadCredentials(subscription);

    expect(result).toEqual(credentials);
    expect(githubOauth.refreshAccessToken).not.toHaveBeenCalled();
    expect(prisma.serviceSubscription.update).not.toHaveBeenCalled();
  });

  it('does not refresh a token that has not expired yet', async () => {
    const credentials = {
      accessToken: 'gho_abc',
      refreshToken: 'ghr_abc',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
    const subscription = {
      id: '1',
      serviceName: 'github',
      credentials: encryptCredentials(credentials),
    };

    const result = await loadCredentials(subscription);

    expect(result).toEqual(credentials);
    expect(githubOauth.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('refreshes and persists an expired token', async () => {
    const expired = {
      accessToken: 'old',
      refreshToken: 'refresh-1',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };
    const refreshed = { accessToken: 'new', refreshToken: 'refresh-2', expiresAt: null };
    githubOauth.refreshAccessToken.mockResolvedValue(refreshed);
    const subscription = {
      id: '1',
      serviceName: 'github',
      credentials: encryptCredentials(expired),
    };

    const result = await loadCredentials(subscription);

    expect(githubOauth.refreshAccessToken).toHaveBeenCalledWith('refresh-1');
    expect(result).toEqual(refreshed);
    expect(prisma.serviceSubscription.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { credentials: expect.objectContaining({ iv: expect.any(String) }) },
    });
  });
});
