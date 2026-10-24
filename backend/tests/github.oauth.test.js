jest.mock('axios');

const axios = require('axios');
const {
  buildAuthorizeUrl,
  verifyState,
  exchangeCodeForToken,
  refreshAccessToken,
} = require('../src/services/github/oauth');

describe('github oauth', () => {
  afterEach(() => jest.clearAllMocks());

  it('embeds a state that resolves back to the same user id', () => {
    const url = buildAuthorizeUrl('user-42');
    const state = new URL(url).searchParams.get('state');

    expect(verifyState(state)).toBe('user-42');
  });

  it('rejects a tampered state', () => {
    expect(() => verifyState('not-a-valid-jwt')).toThrow(/Invalid or expired OAuth state/);
  });

  it('exchanges a code for a non-expiring token', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'gho_abc' } });

    const credentials = await exchangeCodeForToken('code-1');

    expect(credentials).toEqual({ accessToken: 'gho_abc', refreshToken: null, expiresAt: null });
  });

  it('exchanges a code for an expiring token with a refresh token', async () => {
    axios.post.mockResolvedValue({
      data: { access_token: 'gho_abc', refresh_token: 'ghr_abc', expires_in: 28800 },
    });

    const credentials = await exchangeCodeForToken('code-1');

    expect(credentials.accessToken).toBe('gho_abc');
    expect(credentials.refreshToken).toBe('ghr_abc');
    expect(new Date(credentials.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects when GitHub returns an error exchanging the code', async () => {
    axios.post.mockResolvedValue({ data: { error: 'bad_verification_code' } });

    await expect(exchangeCodeForToken('bad-code')).rejects.toThrow(/bad_verification_code/);
  });

  it('refreshes an access token, keeping the old refresh token if none is reissued', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'gho_new' } });

    const credentials = await refreshAccessToken('ghr_old');

    expect(credentials).toEqual({
      accessToken: 'gho_new',
      refreshToken: 'ghr_old',
      expiresAt: null,
    });
  });
});
