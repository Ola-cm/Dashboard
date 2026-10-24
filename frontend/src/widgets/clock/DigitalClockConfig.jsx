export default function DigitalClockConfig({ value, onChange }) {
  return (
    <div>
      <label htmlFor="digital_clock-timezone" className="block text-sm text-brown-600 mb-1">
        Timezone
      </label>
      <input
        id="digital_clock-timezone"
        type="text"
        value={value.timezone || ''}
        onChange={(e) => onChange({ ...value, timezone: e.target.value })}
        placeholder="e.g. Europe/Paris"
        className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
      />
      <p className="mt-1 text-xs text-brown-400">Any IANA timezone name, e.g. Africa/Porto-Novo.</p>
    </div>
  );
}
