// Widget metadata only — feeds services/definitions/discord.js. Every widget here is
// authenticated with the logged-in user's own linked Discord account (OAuth, scopes
// `identify guilds`).
module.exports = [
  {
    name: 'profile',
    description: "The linked account's avatar, display name and username",
    params: [{ name: 'avatar_size', type: 'integer' }],
  },
  {
    name: 'my_servers',
    description: 'The servers the linked account belongs to, with member counts',
    params: [{ name: 'count', type: 'integer' }],
  },
  {
    name: 'server_stats',
    description: "A server's name, owner status, member count and online members",
    params: [{ name: 'guild_id', type: 'string' }],
  },
  {
    name: 'channel_messages',
    description: 'The latest messages of a public channel in a server the account belongs to',
    params: [
      { name: 'channel_id', type: 'string' },
      { name: 'count', type: 'integer' },
    ],
  },
];
