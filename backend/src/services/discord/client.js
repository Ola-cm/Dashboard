const axios = require('axios');
const { withRetry } = require('../httpClient');

const API_URL = 'https://discord.com/api/v10';

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function getCurrentUser(accessToken) {
  const { data } = await withRetry(() =>
    axios.get(`${API_URL}/users/@me`, { headers: authHeaders(accessToken) }),
  );
  return data;
}

// with_counts adds approximate_member_count / approximate_presence_count to every guild.
async function getUserGuilds(accessToken) {
  const { data } = await withRetry(() =>
    axios.get(`${API_URL}/users/@me/guilds`, {
      headers: authHeaders(accessToken),
      params: { with_counts: true },
    }),
  );
  return data;
}

// Bot-authenticated calls. Discord only lets a bot read channel messages: a user's own OAuth
// token can't, and DMs or notifications aren't exposed to applications at all.
function botHeaders(botToken) {
  return { Authorization: `Bot ${botToken}` };
}

// Turns Discord's HTTP failures into errors the dashboard can show. 401 is remapped because the
// frontend treats any 401 as an expired session (see dashboardService.getWidgetData).
async function botRequest(request) {
  try {
    const { data } = await withRetry(request);
    return data;
  } catch (err) {
    const status = err.response?.status;
    const failure = new Error(
      {
        401: 'The Discord bot token is invalid',
        403: 'The Discord bot cannot access this channel — invite it to the server first',
        404: 'Discord channel not found',
      }[status] || 'Discord could not be reached',
    );
    failure.status = status === 404 ? 404 : 424;
    throw failure;
  }
}

function getChannel(botToken, channelId) {
  return botRequest(() =>
    axios.get(`${API_URL}/channels/${encodeURIComponent(channelId)}`, {
      headers: botHeaders(botToken),
    }),
  );
}

function getGuildRoles(botToken, guildId) {
  return botRequest(() =>
    axios.get(`${API_URL}/guilds/${encodeURIComponent(guildId)}/roles`, {
      headers: botHeaders(botToken),
    }),
  );
}

function getChannelMessages(botToken, channelId, limit) {
  return botRequest(() =>
    axios.get(`${API_URL}/channels/${encodeURIComponent(channelId)}/messages`, {
      headers: botHeaders(botToken),
      params: { limit },
    }),
  );
}

module.exports = {
  getCurrentUser,
  getUserGuilds,
  getChannel,
  getGuildRoles,
  getChannelMessages,
};
