// Channel messages are read with the application's bot, so the bot can see far more than any one
// user. A widget therefore only exposes a channel when both hold:
//   - the linked account is a member of the channel's server, and
//   - the channel is public: @everyone can view it and read its history.
// Private channels stay private, whatever channel ID someone types in.
const VIEW_CHANNEL = 1n << 10n;
const READ_MESSAGE_HISTORY = 1n << 16n;
const PUBLIC_PERMISSIONS = VIEW_CHANNEL | READ_MESSAGE_HISTORY;
const MAX_CONTENT_LENGTH = 300;
const MAX_MESSAGES = 20;

function forbidden(message) {
  const err = new Error(message);
  err.status = 403;
  return err;
}

// @everyone's permissions in a channel: the server-wide base, then the channel's own overwrite
// (the @everyone role has the same id as the server).
function everyoneCanRead(channel, roles) {
  const everyone = roles.find((role) => role.id === channel.guild_id);
  let permissions = BigInt(everyone?.permissions || 0);
  const overwrite = (channel.permission_overwrites || []).find((o) => o.id === channel.guild_id);
  if (overwrite) {
    permissions = (permissions & ~BigInt(overwrite.deny)) | BigInt(overwrite.allow);
  }
  return (permissions & PUBLIC_PERMISSIONS) === PUBLIC_PERMISSIONS;
}

async function assertReadable({ client, botToken, channelId, userGuilds }) {
  const channel = await client.getChannel(botToken, channelId);
  if (!channel.guild_id || !userGuilds.some((guild) => guild.id === channel.guild_id)) {
    throw forbidden('This account is not a member of the server that owns this channel');
  }
  const roles = await client.getGuildRoles(botToken, channel.guild_id);
  if (!everyoneCanRead(channel, roles)) {
    throw forbidden('Only public channels can be shown');
  }
  return channel;
}

// Raw mentions (<@123>, <#456>, <:smile:789>) are unreadable text: swap them for their names.
function readableContent(message) {
  const names = new Map((message.mentions || []).map((u) => [u.id, u.global_name || u.username]));
  const text = (message.content || '')
    .replace(/<@!?(\d+)>/g, (_, id) => `@${names.get(id) || 'user'}`)
    .replace(/<@&\d+>/g, '@role')
    .replace(/<#\d+>/g, '#channel')
    .replace(/<a?:(\w+):\d+>/g, ':$1:');
  return text.length > MAX_CONTENT_LENGTH ? `${text.slice(0, MAX_CONTENT_LENGTH)}…` : text;
}

function formatMessage(message, avatarUrl) {
  return {
    id: message.id,
    author: message.author.global_name || message.author.username,
    avatarUrl: avatarUrl(message.author, 32),
    content: readableContent(message),
    attachmentCount: (message.attachments || []).length,
    createdAt: message.timestamp,
  };
}

module.exports = { assertReadable, formatMessage, everyoneCanRead, MAX_MESSAGES };
