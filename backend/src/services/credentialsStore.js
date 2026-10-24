// Reads a ServiceSubscription's stored credentials for use with providerRegistry.fetchWidgetData
// — decrypts them, and transparently refreshes (and re-persists) an expired token when the
// service supports it. Services whose tokens never expire (e.g. a plain GitHub OAuth App) just
// skip the refresh step, since `expiresAt` stays null.
const prisma = require('../config/prisma');
const { encryptCredentials, decryptCredentials } = require('./crypto');
const githubOauth = require('./github/oauth');
const youtubeOauth = require('./youtube/oauth');
const discordOauth = require('./discord/oauth');

const REFRESHERS = {
  github: githubOauth.refreshAccessToken,
  youtube: youtubeOauth.refreshAccessToken,
  discord: discordOauth.refreshAccessToken,
};

async function loadCredentials(subscription) {
  if (!subscription?.credentials) {
    return null;
  }

  let credentials = decryptCredentials(subscription.credentials);
  const refresh = REFRESHERS[subscription.serviceName];
  const isExpired = credentials.expiresAt && new Date(credentials.expiresAt) <= new Date();

  if (refresh && isExpired && credentials.refreshToken) {
    credentials = await refresh(credentials.refreshToken);
    await prisma.serviceSubscription.update({
      where: { id: subscription.id },
      data: { credentials: encryptCredentials(credentials) },
    });
  }

  return credentials;
}

module.exports = { loadCredentials };
