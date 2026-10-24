// Manual OAuth flow (no passport) — the app is stateless JWT auth end to end, so linking a
// GitHub account just needs a signed `state` to carry the user id across the redirect.
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {
  githubClientId,
  githubClientSecret,
  githubCallbackUrl,
  jwtSecret,
} = require('../../config/env');

function buildAuthorizeUrl(userId) {
  const state = jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: githubClientId,
    redirect_uri: githubCallbackUrl,
    scope: 'repo read:user',
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
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

// A plain GitHub OAuth App's tokens don't expire, so `expiresAt`/`refreshToken` are null unless
// the app has "expiring user authorization tokens" turned on, in which case GitHub includes
// `expires_in` and `refresh_token` in the response too.
function toCredentials(data) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
  };
}

async function exchangeCodeForToken(code) {
  const { data } = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code,
      redirect_uri: githubCallbackUrl,
    },
    { headers: { Accept: 'application/json' } },
  );
  if (data.error) {
    const err = new Error(data.error_description || data.error);
    err.status = 400;
    throw err;
  }
  return toCredentials(data);
}

async function refreshAccessToken(refreshToken) {
  const { data } = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: githubClientId,
      client_secret: githubClientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
    { headers: { Accept: 'application/json' } },
  );
  if (data.error) {
    const err = new Error(data.error_description || data.error);
    err.status = 400;
    throw err;
  }
  const credentials = toCredentials(data);
  // Some responses omit refresh_token when it hasn't rotated — keep the one we already have.
  return { ...credentials, refreshToken: credentials.refreshToken || refreshToken };
}

module.exports = { buildAuthorizeUrl, verifyState, exchangeCodeForToken, refreshAccessToken };
