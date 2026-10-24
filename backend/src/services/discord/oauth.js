// Discord OAuth2 Authorization Code flow — same manual pattern as services/youtube/oauth.js.
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {
  discordClientId,
  discordClientSecret,
  discordOauthCallbackUrl,
  jwtSecret,
} = require('../../config/env');

const AUTHORIZE_URL = 'https://discord.com/oauth2/authorize';
const TOKEN_URL = 'https://discord.com/api/oauth2/token';
const SCOPE = 'identify guilds';

function basicAuthHeader() {
  const basic = Buffer.from(`${discordClientId}:${discordClientSecret}`).toString('base64');
  return { Authorization: `Basic ${basic}` };
}

function buildAuthorizeUrl(userId) {
  const state = jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: discordClientId,
    response_type: 'code',
    redirect_uri: discordOauthCallbackUrl,
    scope: SCOPE,
    state,
    // Always show Discord's consent screen, even when the account already authorized the app.
    prompt: 'consent',
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

function verifyState(state) {
  try {
    return jwt.verify(state, jwtSecret).sub;
  } catch {
    const err = new Error('Invalid or expired OAuth state');
    err.status = 400;
    throw err;
  }
}

function toCredentials(data, fallbackRefreshToken) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || fallbackRefreshToken || null,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
  };
}

async function exchangeCodeForToken(code) {
  const { data } = await axios.post(
    TOKEN_URL,
    new URLSearchParams({
      code,
      redirect_uri: discordOauthCallbackUrl,
      grant_type: 'authorization_code',
    }),
    { headers: basicAuthHeader() },
  );
  return toCredentials(data);
}

async function refreshAccessToken(refreshToken) {
  const { data } = await axios.post(
    TOKEN_URL,
    new URLSearchParams({ refresh_token: refreshToken, grant_type: 'refresh_token' }),
    { headers: basicAuthHeader() },
  );
  // Discord rotates the refresh token on every refresh; fall back to the old one if it's missing.
  return toCredentials(data, refreshToken);
}

module.exports = { buildAuthorizeUrl, verifyState, exchangeCodeForToken, refreshAccessToken };
