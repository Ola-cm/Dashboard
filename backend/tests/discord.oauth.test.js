jest.mock('axios');

const axios = require('axios');
const {
  buildAuthorizeUrl,
  verifyState,
  exchangeCodeForToken,
  refreshAccessToken,
} = require('../src/services/discord/oauth');

describe('discord oauth', () => {
  afterEach(() => jest.clearAllMocks());

  it('embeds a state that resolves back to the same user id', () => {
    const url = buildAuthorizeUrl('user-42');
    const state = new URL(url).searchParams.get('state');

    expect(verifyState(state)).toBe('user-42');
  });

  it('asks for the identify and guilds scopes and always shows the consent screen', () => {
    const url = new URL(buildAuthorizeUrl('user-42'));

    expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize');
    expect(url.searchParams.get('scope')).toBe('identify guilds');
    expect(url.searchParams.get('prompt')).toBe('consent');
  });

  it('rejects a tampered state', () => {
    expect(() => verifyState('not-a-valid-jwt')).toThrow(/Invalid or expired OAuth state/);
  });

  it('exchanges a code for an access token with expiry', async () => {
    axios.post.mockResolvedValue({
      data: { access_token: 'dsc_abc', refresh_token: 'dscr_abc', expires_in: 3600 },
    });

    const credentials = await exchangeCodeForToken('code-1');

    expect(credentials.accessToken).toBe('dsc_abc');
    expect(credentials.refreshToken).toBe('dscr_abc');
    expect(new Date(credentials.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('refreshes an access token, keeping the old refresh token if none is reissued', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'dsc_new', expires_in: 3600 } });

    const credentials = await refreshAccessToken('dscr_old');

    expect(credentials.accessToken).toBe('dsc_new');
    expect(credentials.refreshToken).toBe('dscr_old');
  });
});
