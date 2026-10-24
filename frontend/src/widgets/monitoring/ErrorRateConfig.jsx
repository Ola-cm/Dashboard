import { useEffect } from 'react';

export default function ErrorRateConfig({ value, onChange }) {
  useEffect(() => {
    if (!value.time_range) {
      onChange({ ...value, time_range: '1h' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="error_rate-endpoint_url" className="block text-sm text-brown-600 mb-1">
          Endpoint URL
        </label>
        <input
          id="error_rate-endpoint_url"
          type="text"
          value={value.endpoint_url || ''}
          onChange={(e) => onChange({ ...value, endpoint_url: e.target.value })}
          placeholder="https://example.com"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="error_rate-time_range" className="block text-sm text-brown-600 mb-1">
          Time range
        </label>
        <select
          id="error_rate-time_range"
          value={value.time_range || '1h'}
          onChange={(e) => onChange({ ...value, time_range: e.target.value })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        >
          <option value="1h">Past hour</option>
          <option value="24h">Past 24 hours</option>
        </select>
      </div>
    </div>
  );
}
