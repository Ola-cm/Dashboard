export default function ServerStatsConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="server_stats-guild_id" className="block text-sm text-brown-600 mb-1">
        Server ID
      </label>
      <input
        id="server_stats-guild_id"
        type="text"
        value={value.guild_id || ''}
        onChange={(e) => onChange({ ...value, guild_id: e.target.value })}
        placeholder="e.g. 123456789012345678"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
      <p className="mt-1 text-[11px] text-brown-400">
        Enable Developer Mode in Discord, then right-click the server and choose Copy Server ID.
      </p>
    </div>
  );
}
