export default function ResponseTimeConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="response_time-url" className="block text-sm text-brown-600 mb-1">
          URL
        </label>
        <input
          id="response_time-url"
          type="text"
          value={value.url || ''}
          onChange={(e) => onChange({ ...value, url: e.target.value })}
          placeholder="https://example.com"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="response_time-samples" className="block text-sm text-brown-600 mb-1">
          Samples
        </label>
        <input
          id="response_time-samples"
          type="number"
          min="1"
          max="10"
          value={value.samples || ''}
          onChange={(e) => onChange({ ...value, samples: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
