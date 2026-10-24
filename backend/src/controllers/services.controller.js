const prisma = require('../config/prisma');
const { getServices } = require('../services/widgetRegistry');
const { encryptCredentials } = require('../services/crypto');
const { frontendUrl } = require('../config/env');

// Services whose data can only be fetched on the user's behalf via OAuth — subscribing to
// these goes through a dedicated /oauth/start route instead of the plain POST /subscribe. Each
// module has the same shape: buildAuthorizeUrl(userId), verifyState(state), exchangeCodeForToken(code).
const OAUTH_PROVIDERS = {
  github: require('../services/github/oauth'),
  youtube: require('../services/youtube/oauth'),
  discord: require('../services/discord/oauth'),
};
const REQUIRES_AUTH = new Set(Object.keys(OAUTH_PROVIDERS));

function assertKnownService(name) {
  const known = getServices().some((service) => service.name === name);
  if (!known) {
    const err = new Error(`Unknown service "${name}"`);
    err.status = 404;
    throw err;
  }
}

async function list(req, res, next) {
  try {
    const subscriptions = await prisma.serviceSubscription.findMany({
      where: { userId: req.user.id },
      select: { serviceName: true },
    });
    const subscribed = new Set(subscriptions.map((s) => s.serviceName));
    const services = getServices().map((service) => {
      const isSubscribed = subscribed.has(service.name);
      const requiresAuth = REQUIRES_AUTH.has(service.name);
      return {
        ...service,
        requiresAuth,
        subscribed: isSubscribed,
        available: !requiresAuth || isSubscribed,
      };
    });
    res.json({ services });
  } catch (err) {
    next(err);
  }
}

async function subscribe(req, res, next) {
  try {
    const { name } = req.params;
    assertKnownService(name);
    if (REQUIRES_AUTH.has(name)) {
      const err = new Error(`Service "${name}" requires the OAuth flow — use /oauth/start`);
      err.status = 400;
      throw err;
    }
    await prisma.serviceSubscription.upsert({
      where: { userId_serviceName: { userId: req.user.id, serviceName: name } },
      update: {},
      create: { userId: req.user.id, serviceName: name },
    });
    res.status(201).json({ message: `Subscribed to ${name}` });
  } catch (err) {
    next(err);
  }
}

async function unsubscribe(req, res, next) {
  try {
    const { name } = req.params;
    await prisma.serviceSubscription.deleteMany({
      where: { userId: req.user.id, serviceName: name },
    });
    res.json({ message: `Unsubscribed from ${name}` });
  } catch (err) {
    next(err);
  }
}

function getOauthProvider(serviceName) {
  const provider = OAUTH_PROVIDERS[serviceName];
  if (!provider) {
    const err = new Error(`"${serviceName}" has no OAuth flow`);
    err.status = 404;
    throw err;
  }
  return provider;
}

function oauthStart(req, res) {
  // A plain redirect won't work here: this route requires a Bearer token, and a top-level
  // browser navigation can't carry one. The frontend calls this via axios (authenticated) and
  // navigates itself once it has the URL.
  const provider = getOauthProvider(req.params.service);
  res.json({ url: provider.buildAuthorizeUrl(req.user.id) });
}

async function oauthCallback(req, res, next) {
  const { service } = req.params;
  // The user can decline the consent screen — the provider then redirects here with `error`
  // instead of `code`. Send them back to the app rather than showing a bare JSON error.
  if (req.query.error) {
    return res.redirect(
      `${frontendUrl}/services?linked=${service}&error=${encodeURIComponent(req.query.error)}`,
    );
  }
  try {
    const provider = getOauthProvider(service);
    const { code, state } = req.query;
    const userId = provider.verifyState(state);
    const tokens = await provider.exchangeCodeForToken(code);
    const credentials = encryptCredentials(tokens);
    await prisma.serviceSubscription.upsert({
      where: { userId_serviceName: { userId, serviceName: service } },
      update: { credentials },
      create: { userId, serviceName: service, credentials },
    });
    res.redirect(`${frontendUrl}/services?linked=${service}`);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, subscribe, unsubscribe, oauthStart, oauthCallback };
