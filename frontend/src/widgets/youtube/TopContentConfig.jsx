import { useEffect } from 'react';

export default function TopContentConfig({ value, onChange }) {
  useEffect(() => {
    if (!value.time_range) {
      onChange({ ...value, time_range: 'month' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="yt_top_content-channel_id" className="block text-sm text-brown-600 mb-1">
          Channel ID
        </label>
        <input
          id="yt_top_content-channel_id"
          type="text"
          value={value.channel_id || ''}
          onChange={(e) => onChange({ ...value, channel_id: e.target.value })}
          placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="yt_top_content-time_range" className="block text-sm text-brown-600 mb-1">
          Time range
        </label>
        <select
          id="yt_top_content-time_range"
          value={value.time_range || 'month'}
          onChange={(e) => onChange({ ...value, time_range: e.target.value })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        >
          <option value="week">Past week</option>
          <option value="month">Past month</option>
          <option value="year">Past year</option>
        </select>
      </div>
    </div>
  );
}
