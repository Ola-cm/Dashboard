jest.mock('../src/services/discord/client');

const env = require('../src/config/env');
const client = require('../src/services/discord/client');
const provider = require('../src/services/discord/provider');

const CREDENTIALS = { accessToken: 'token-1' };

const GUILDS = [
  {
    id: '111',
    name: 'Study group',
    icon: 'abc123',
    owner: true,
    approximate_member_count: 42,
    approximate_presence_count: 7,
  },
  { id: '222', name: 'Game night', icon: null, owner: false },
];

describe('discord provider', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches and formats the linked profile', async () => {
    client.getCurrentUser.mockResolvedValue({
      id: '80351110224678912',
      username: 'nelly',
      global_name: 'Nelly',
      avatar: 'hash1',
    });

    const result = await provider.fetchWidgetData('profile', { avatar_size: 128 }, CREDENTIALS);

    expect(client.getCurrentUser).toHaveBeenCalledWith('token-1');
    expect(result.data).toEqual({
      id: '80351110224678912',
      username: 'nelly',
      displayName: 'Nelly',
      avatarUrl: 'https://cdn.discordapp.com/avatars/80351110224678912/hash1.png?size=128',
    });
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('uses the requested avatar size when the CDN supports it, the default otherwise', async () => {
    client.getCurrentUser.mockResolvedValue({ id: '1', username: 'nelly', avatar: 'h' });

    const small = await provider.fetchWidgetData('profile', { avatar_size: 64 }, CREDENTIALS);
    const odd = await provider.fetchWidgetData('profile', { avatar_size: 100 }, CREDENTIALS);

    expect(small.data.avatarUrl).toMatch(/size=64$/);
    expect(odd.data.avatarUrl).toMatch(/size=128$/);
  });

  it('falls back to the username and a default avatar for a bare account', async () => {
    client.getCurrentUser.mockResolvedValue({
      id: '80351110224678912',
      username: 'nelly',
      global_name: null,
      avatar: null,
    });

    const { data } = await provider.fetchWidgetData('profile', { avatar_size: 128 }, CREDENTIALS);

    expect(data.displayName).toBe('nelly');
    expect(data.avatarUrl).toMatch(/^https:\/\/cdn\.discordapp\.com\/embed\/avatars\/[0-5]\.png$/);
  });

  it('lists the servers the account belongs to, limited by count', async () => {
    client.getUserGuilds.mockResolvedValue(GUILDS);

    const result = await provider.fetchWidgetData('my_servers', { count: 1 }, CREDENTIALS);

    expect(result.data.total).toBe(2);
    expect(result.data.servers).toEqual([
      {
        id: '111',
        name: 'Study group',
        iconUrl: 'https://cdn.discordapp.com/icons/111/abc123.png?size=64',
        owner: true,
        memberCount: 42,
        onlineCount: 7,
      },
    ]);
  });

  it('returns the stats of one server by id', async () => {
    client.getUserGuilds.mockResolvedValue(GUILDS);

    const result = await provider.fetchWidgetData(
      'server_stats',
      { guild_id: ' 222 ' },
      CREDENTIALS,
    );

    expect(result.data).toEqual({
      id: '222',
      name: 'Game night',
      iconUrl: null,
      owner: false,
      memberCount: null,
      onlineCount: null,
    });
  });

  it('rejects server stats for a server the account is not in', async () => {
    client.getUserGuilds.mockResolvedValue(GUILDS);

    await expect(
      provider.fetchWidgetData('server_stats', { guild_id: '999' }, CREDENTIALS),
    ).rejects.toMatchObject({ status: 404 });
  });

  describe('channel_messages', () => {
    const CONFIG = { channel_id: '555', count: 2 };
    const VIEW_AND_HISTORY = String((1 << 10) | (1 << 16));
    const PUBLIC_CHANNEL = {
      id: '555',
      name: 'general',
      guild_id: '111',
      permission_overwrites: [],
    };
    const ROLES = [{ id: '111', permissions: VIEW_AND_HISTORY }];

    beforeEach(() => {
      env.discordBotToken = 'bot-1';
      client.getUserGuilds.mockResolvedValue(GUILDS);
      client.getChannel.mockResolvedValue(PUBLIC_CHANNEL);
      client.getGuildRoles.mockResolvedValue(ROLES);
    });

    afterAll(() => {
      delete env.discordBotToken;
    });

    it('reads and formats the latest messages of a public channel', async () => {
      client.getChannelMessages.mockResolvedValue([
        {
          id: 'm1',
          author: { id: '1', username: 'nelly', global_name: 'Nelly', avatar: 'h' },
          content: 'hi <@2> see <#9> <:smile:77>',
          mentions: [{ id: '2', username: 'sam', global_name: null }],
          attachments: [{ id: 'a' }],
          timestamp: '2026-10-10T10:00:00.000000+00:00',
        },
      ]);

      const result = await provider.fetchWidgetData('channel_messages', CONFIG, CREDENTIALS);

      expect(client.getChannelMessages).toHaveBeenCalledWith('bot-1', '555', 2);
      expect(result.data.channelName).toBe('general');
      expect(result.data.messages).toEqual([
        {
          id: 'm1',
          author: 'Nelly',
          avatarUrl: 'https://cdn.discordapp.com/avatars/1/h.png?size=32',
          content: 'hi @sam see #channel :smile:',
          attachmentCount: 1,
          createdAt: '2026-10-10T10:00:00.000000+00:00',
        },
      ]);
    });

    it('refuses a channel of a server the account is not in', async () => {
      client.getChannel.mockResolvedValue({ ...PUBLIC_CHANNEL, guild_id: '999' });

      await expect(
        provider.fetchWidgetData('channel_messages', CONFIG, CREDENTIALS),
      ).rejects.toMatchObject({ status: 403 });
      expect(client.getChannelMessages).not.toHaveBeenCalled();
    });

    it('refuses a channel @everyone cannot see, through a permission overwrite', async () => {
      client.getChannel.mockResolvedValue({
        ...PUBLIC_CHANNEL,
        permission_overwrites: [{ id: '111', allow: '0', deny: String(1 << 10) }],
      });

      await expect(
        provider.fetchWidgetData('channel_messages', CONFIG, CREDENTIALS),
      ).rejects.toMatchObject({ status: 403, message: 'Only public channels can be shown' });
      expect(client.getChannelMessages).not.toHaveBeenCalled();
    });

    it('refuses a channel when the server-wide @everyone role cannot read history', async () => {
      client.getGuildRoles.mockResolvedValue([{ id: '111', permissions: String(1 << 10) }]);

      await expect(
        provider.fetchWidgetData('channel_messages', CONFIG, CREDENTIALS),
      ).rejects.toMatchObject({ status: 403 });
    });

    it('fails clearly when no bot token is configured', async () => {
      delete env.discordBotToken;

      await expect(
        provider.fetchWidgetData('channel_messages', CONFIG, CREDENTIALS),
      ).rejects.toMatchObject({ status: 424, message: /bot is not configured/ });
    });
  });

  it('rejects when no Discord account is linked', async () => {
    await expect(
      provider.fetchWidgetData('profile', { avatar_size: 128 }, null),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Discord account not linked',
    });
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('does_not_exist', {}, CREDENTIALS)).rejects.toThrow(
      /Unknown discord widget/,
    );
  });
});
