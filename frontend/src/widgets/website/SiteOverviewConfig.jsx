export default function SiteOverviewConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="site_overview-url" className="block text-sm text-brown-600 mb-1">
        Website
      </label>
      <input
        id="site_overview-url"
        type="text"
        value={value.url || ''}
        onChange={(e) => onChange({ ...value, url: e.target.value })}
        placeholder="e.g. github.com"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
    </div>
  );
}
