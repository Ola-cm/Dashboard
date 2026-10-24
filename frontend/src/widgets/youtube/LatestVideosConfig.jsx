export default function LatestVideosConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="latest_videos-channel_id" className="block text-sm text-brown-600 mb-1">
          Channel ID
        </label>
        <input
          id="latest_videos-channel_id"
          type="text"
          value={value.channel_id || ''}
          onChange={(e) => onChange({ ...value, channel_id: e.target.value })}
          placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="latest_videos-count" className="block text-sm text-brown-600 mb-1">
          Number of items
        </label>
        <input
          id="latest_videos-count"
          type="number"
          min="1"
          max="20"
          value={value.count || ''}
          onChange={(e) => onChange({ ...value, count: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
