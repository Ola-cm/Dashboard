// Every widget in this service is authenticated with the logged-in user's own OAuth access token
// — a user token can read public channel data just fine, so channel_stats/latest_videos/
// top_content work the same way as watch_later, just against public endpoints.
const axios = require('axios');
const { withRetry } = require('../httpClient');

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const RANGE_TO_DAYS = { week: 7, month: 30, year: 365 };

function publishedAfterFor(timeRange) {
  const days = RANGE_TO_DAYS[timeRange] || RANGE_TO_DAYS.month;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function getChannelStats(accessToken, channelId) {
  const { data } = await withRetry(() =>
    axios.get(`${YOUTUBE_API_URL}/channels`, {
      headers: authHeaders(accessToken),
      params: { part: 'snippet,statistics', id: channelId },
    }),
  );
  const channel = data.items?.[0];
  if (!channel) {
    const err = new Error(`Unknown YouTube channel "${channelId}"`);
    err.status = 404;
    throw err;
  }
  return {
    name: channel.snippet.title,
    followers: Number(channel.statistics.subscriberCount),
    secondary: { label: 'Total views', value: Number(channel.statistics.viewCount) },
  };
}

async function getLatestVideos(accessToken, channelId, count) {
  const { data } = await withRetry(() =>
    axios.get(`${YOUTUBE_API_URL}/search`, {
      headers: authHeaders(accessToken),
      params: {
        part: 'snippet',
        channelId,
        order: 'date',
        type: 'video',
        maxResults: count,
      },
    }),
  );
  return {
    items: data.items.map((item) => ({
      title: item.snippet.title,
      date: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    })),
  };
}

// search.list can order by viewCount within a date window, but doesn't return the view count
// itself — a second call to videos.list gets the real numbers for those same ids.
async function getTopContent(accessToken, channelId, timeRange) {
  const { data: searchData } = await withRetry(() =>
    axios.get(`${YOUTUBE_API_URL}/search`, {
      headers: authHeaders(accessToken),
      params: {
        part: 'snippet',
        channelId,
        order: 'viewCount',
        type: 'video',
        publishedAfter: publishedAfterFor(timeRange),
        maxResults: 5,
      },
    }),
  );
  const ids = searchData.items.map((item) => item.id.videoId).join(',');
  if (!ids) {
    return { items: [] };
  }
  const { data: videosData } = await withRetry(() =>
    axios.get(`${YOUTUBE_API_URL}/videos`, {
      headers: authHeaders(accessToken),
      params: { part: 'snippet,statistics', id: ids },
    }),
  );
  return {
    items: videosData.items.map((video) => ({
      title: video.snippet.title,
      metric: `${Number(video.statistics.viewCount).toLocaleString()} views`,
    })),
  };
}

// "WL" is YouTube's fixed, special playlist id for the signed-in user's Watch Later list — it's
// not returned by playlists.list, but playlistItems.list accepts it directly.
async function getWatchLater(accessToken, count) {
  const { data } = await withRetry(() =>
    axios.get(`${YOUTUBE_API_URL}/playlistItems`, {
      headers: authHeaders(accessToken),
      params: { part: 'snippet', playlistId: 'WL', maxResults: count },
    }),
  );
  return {
    items: data.items.map((item) => ({
      title: item.snippet.title,
      date: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    })),
  };
}

module.exports = { getChannelStats, getLatestVideos, getTopContent, getWatchLater };
