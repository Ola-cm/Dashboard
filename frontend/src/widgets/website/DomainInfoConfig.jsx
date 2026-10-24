export default function DomainInfoConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="domain_info-domain" className="block text-sm text-brown-600 mb-1">
        Domain
      </label>
      <input
        id="domain_info-domain"
        type="text"
        value={value.domain || ''}
        onChange={(e) => onChange({ ...value, domain: e.target.value })}
        placeholder="e.g. github.com"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
      <p className="mt-1 text-xs text-brown-400">
        Some extensions (e.g. .eu) don&apos;t publish registration data.
      </p>
    </div>
  );
}
