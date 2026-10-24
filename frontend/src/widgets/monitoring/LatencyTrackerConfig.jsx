export default function LatencyTrackerConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="latency_tracker-endpoint_url"
          className="block text-sm text-brown-600 mb-1"
        >
          Endpoint URL
        </label>
        <input
          id="latency_tracker-endpoint_url"
          type="text"
          value={value.endpoint_url || ''}
          onChange={(e) => onChange({ ...value, endpoint_url: e.target.value })}
          placeholder="https://example.com"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label
          htmlFor="latency_tracker-sample_count"
          className="block text-sm text-brown-600 mb-1"
        >
          Sample count
        </label>
        <input
          id="latency_tracker-sample_count"
          type="number"
          min="2"
          max="20"
          value={value.sample_count || ''}
          onChange={(e) => onChange({ ...value, sample_count: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
