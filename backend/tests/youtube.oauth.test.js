jest.mock('axios');

const axios = require('axios');
const {
  buildAuthorizeUrl,
  verifyState,
  exchangeCodeForToken,
  refreshAccessToken,
} = require('../src/services/youtube/oauth');

describe('youtube oauth', () => {
  afterEach(() => jest.clearAllMocks());

  it('embeds a state that resolves back to the same user id', () => {
    const url = buildAuthorizeUrl('user-42');
    const state = new URL(url).searchParams.get('state');

    expect(verifyState(state)).toBe('user-42');
  });

  it('requests offline access and forces the consent screen, to always get a refresh token', () => {
    const url = buildAuthorizeUrl('user-42');
    const params = new URL(url).searchParams;

    expect(params.get('access_type')).toBe('offline');
    expect(params.get('prompt')).toBe('consent');
  });

  it('rejects a tampered state', () => {
    expect(() => verifyState('not-a-valid-jwt')).toThrow(/Invalid or expired OAuth state/);
  });

  it('exchanges a code for an access token with expiry', async () => {
    axios.post.mockResolvedValue({
      data: { access_token: 'ya29.abc', refresh_token: '1//abc', expires_in: 3600 },
    });

    const credentials = await exchangeCodeForToken('code-1');

    expect(credentials.accessToken).toBe('ya29.abc');
    expect(credentials.refreshToken).toBe('1//abc');
    expect(new Date(credentials.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('refreshes an access token, keeping the old refresh token since Google never re-issues one', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'ya29.new', expires_in: 3600 } });

    const credentials = await refreshAccessToken('1//old');

    expect(credentials.accessToken).toBe('ya29.new');
    expect(credentials.refreshToken).toBe('1//old');
  });
});
