const client = require('./client');
const messages = require('./messages');
const env = require('../../config/env');

const CDN_URL = 'https://cdn.discordapp.com';
const MAX_SERVERS = 25;
// Sizes the Discord CDN accepts for avatars (powers of two).
const AVATAR_SIZES = [16, 32, 64, 128, 256, 512];
const DEFAULT_AVATAR_SIZE = 128;

function avatarUrl(user, requestedSize) {
  const size = AVATAR_SIZES.includes(requestedSize) ? requestedSize : DEFAULT_AVATAR_SIZE;
  if (user.avatar) {
    return `${CDN_URL}/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  }
  // Accounts without a custom avatar get one of Discord's default images, picked from the id.
  return `${CDN_URL}/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`;
}

function guildIconUrl(guild) {
  return guild.icon ? `${CDN_URL}/icons/${guild.id}/${guild.icon}.png?size=64` : null;
}

function formatGuild(guild) {
  return {
    id: guild.id,
    name: guild.name,
    iconUrl: guildIconUrl(guild),
    owner: Boolean(guild.owner),
    memberCount: guild.approximate_member_count ?? null,
    onlineCount: guild.approximate_presence_count ?? null,
  };
}

const handlers = {
  profile: async (config, credentials) => {
    const user = await client.getCurrentUser(credentials.accessToken);
    return {
      id: user.id,
      username: user.username,
      displayName: user.global_name || user.username,
      avatarUrl: avatarUrl(user, config.avatar_size),
    };
  },
  my_servers: async (config, credentials) => {
    const guilds = await client.getUserGuilds(credentials.accessToken);
    const count = Math.min(Math.max(config.count || 1, 1), MAX_SERVERS);
    return { total: guilds.length, servers: guilds.slice(0, count).map(formatGuild) };
  },
  server_stats: async (config, credentials) => {
    const guilds = await client.getUserGuilds(credentials.accessToken);
    const guild = guilds.find((g) => g.id === String(config.guild_id).trim());
    if (!guild) {
      const err = new Error('This account is not a member of that server');
      err.status = 404;
      throw err;
    }
    return formatGuild(guild);
  },
  channel_messages: async (config, credentials) => {
    if (!env.discordBotToken) {
      const err = new Error('The Discord bot is not configured on this server');
      err.status = 424;
      throw err;
    }
    const channelId = String(config.channel_id).trim();
    const guilds = await client.getUserGuilds(credentials.accessToken);
    const channel = await messages.assertReadable({
      client,
      botToken: env.discordBotToken,
      channelId,
      userGuilds: guilds,
    });
    const limit = Math.min(Math.max(config.count || 1, 1), messages.MAX_MESSAGES);
    const raw = await client.getChannelMessages(env.discordBotToken, channelId, limit);
    return {
      channelId,
      channelName: channel.name,
      messages: raw.map((message) => messages.formatMessage(message, avatarUrl)),
    };
  },
};

async function fetchWidgetData(widgetName, config, credentials) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown discord widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  if (!credentials?.accessToken) {
    const err = new Error('Discord account not linked');
    err.status = 401;
    throw err;
  }
  const data = await handler(config, credentials);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
