// Google OAuth2 (Authorization Code) — same manual pattern as services/github/oauth.js: a signed
// `state` carries the user id across the redirect, since the app has no server-side session.
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {
  youtubeClientId,
  youtubeClientSecret,
  youtubeOauthCallbackUrl,
  jwtSecret,
} = require('../../config/env');

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

function buildAuthorizeUrl(userId) {
  const state = jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: youtubeClientId,
    redirect_uri: youtubeOauthCallbackUrl,
    response_type: 'code',
    scope: SCOPE,
    state,
    // Google only issues a refresh_token on the very first consent unless the user is forced
    // back through the consent screen every time — access_type=offline + prompt=consent is what
    // guarantees we get one on every re-link, not just the first.
    access_type: 'offline',
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
      client_id: youtubeClientId,
      client_secret: youtubeClientSecret,
      code,
      redirect_uri: youtubeOauthCallbackUrl,
      grant_type: 'authorization_code',
    }),
  );
  return toCredentials(data);
}

async function refreshAccessToken(refreshToken) {
  const { data } = await axios.post(
    TOKEN_URL,
    new URLSearchParams({
      client_id: youtubeClientId,
      client_secret: youtubeClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  );
  // Google's refresh response never re-issues a refresh_token — keep the one we already have.
  return toCredentials(data, refreshToken);
}

module.exports = { buildAuthorizeUrl, verifyState, exchangeCodeForToken, refreshAccessToken };
