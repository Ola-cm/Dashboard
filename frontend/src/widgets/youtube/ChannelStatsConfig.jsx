export default function ChannelStatsConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="channel_stats-channel_id" className="block text-sm text-brown-600 mb-1">
        Channel ID
      </label>
      <input
        id="channel_stats-channel_id"
        type="text"
        value={value.channel_id || ''}
        onChange={(e) => onChange({ ...value, channel_id: e.target.value })}
        placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
    </div>
  );
}
