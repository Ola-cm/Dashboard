jest.mock('../src/services/youtube/client');

const client = require('../src/services/youtube/client');
const provider = require('../src/services/youtube/provider');

describe('youtube provider', () => {
  afterEach(() => jest.clearAllMocks());

  it("fetches a channel's stats", async () => {
    client.getChannelStats.mockResolvedValue({ name: 'Some Channel', followers: 10 });

    const result = await provider.fetchWidgetData(
      'channel_stats',
      { channel_id: 'UCabc' },
      { accessToken: 'ya29.abc' },
    );

    expect(client.getChannelStats).toHaveBeenCalledWith('ya29.abc', 'UCabc');
    expect(result.data.name).toBe('Some Channel');
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it("fetches a channel's latest videos", async () => {
    client.getLatestVideos.mockResolvedValue({ items: [{ title: 'Video' }] });

    const result = await provider.fetchWidgetData(
      'latest_videos',
      { channel_id: 'UCabc', count: 5 },
      { accessToken: 'ya29.abc' },
    );

    expect(client.getLatestVideos).toHaveBeenCalledWith('ya29.abc', 'UCabc', 5);
    expect(result.data.items).toHaveLength(1);
  });

  it("fetches a channel's top content over a period", async () => {
    client.getTopContent.mockResolvedValue({ items: [{ title: 'Popular video' }] });

    const result = await provider.fetchWidgetData(
      'top_content',
      { channel_id: 'UCabc', time_range: 'month' },
      { accessToken: 'ya29.abc' },
    );

    expect(client.getTopContent).toHaveBeenCalledWith('ya29.abc', 'UCabc', 'month');
    expect(result.data.items).toHaveLength(1);
  });

  it("fetches the logged-in user's watch later playlist", async () => {
    client.getWatchLater.mockResolvedValue({
      items: [{ title: 'Some video', date: '2026-01-01T00:00:00Z', url: 'https://youtu.be/x' }],
    });

    const result = await provider.fetchWidgetData(
      'watch_later',
      { count: 5 },
      { accessToken: 'ya29.abc' },
    );

    expect(client.getWatchLater).toHaveBeenCalledWith('ya29.abc', 5);
    expect(result.data.items).toHaveLength(1);
  });

  it('rejects when the user has not linked a YouTube account', async () => {
    await expect(provider.fetchWidgetData('watch_later', { count: 5 }, {})).rejects.toThrow(
      /YouTube account not linked/,
    );
  });

  it('rejects an unknown widget name', async () => {
    await expect(
      provider.fetchWidgetData('does_not_exist', {}, { accessToken: 'ya29.abc' }),
    ).rejects.toThrow(/Unknown youtube widget/);
  });
});
