export default function ChannelMessagesConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="channel_messages-channel_id" className="block text-sm text-brown-600 mb-1">
          Channel ID
        </label>
        <input
          id="channel_messages-channel_id"
          type="text"
          value={value.channel_id || ''}
          onChange={(e) => onChange({ ...value, channel_id: e.target.value })}
          placeholder="e.g. 123456789012345678"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
        <p className="mt-1 text-[11px] text-brown-400">
          Right-click the channel and choose Copy Channel ID (Developer Mode). Only public channels
          of a server you belong to, where the dashboard's bot has been invited, can be shown.
        </p>
      </div>
      <div>
        <label htmlFor="channel_messages-count" className="block text-sm text-brown-600 mb-1">
          Number of messages
        </label>
        <input
          id="channel_messages-count"
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
