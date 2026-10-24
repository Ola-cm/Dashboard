// Widget metadata only — feeds services/definitions/youtube.js. Every widget here is
// authenticated with the logged-in user's own linked YouTube account (OAuth).
module.exports = [
  {
    name: 'channel_stats',
    description: "A channel's subscribers and total views",
    params: [{ name: 'channel_id', type: 'string' }],
  },
  {
    name: 'latest_videos',
    description: 'Latest videos published by a channel',
    params: [
      { name: 'channel_id', type: 'string' },
      { name: 'count', type: 'integer' },
    ],
  },
  {
    name: 'top_content',
    description: "A channel's most viewed videos over a period",
    params: [
      { name: 'channel_id', type: 'string' },
      { name: 'time_range', type: 'string' },
    ],
  },
  {
    name: 'watch_later',
    description: "Videos in the logged-in user's Watch Later playlist",
    params: [{ name: 'count', type: 'integer' }],
  },
];
