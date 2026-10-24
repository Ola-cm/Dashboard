export default function UptimeCheckConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="uptime_check-url" className="block text-sm text-brown-600 mb-1">
        URL
      </label>
      <input
        id="uptime_check-url"
        type="text"
        value={value.url || ''}
        onChange={(e) => onChange({ ...value, url: e.target.value })}
        placeholder="https://example.com"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
    </div>
  );
}
