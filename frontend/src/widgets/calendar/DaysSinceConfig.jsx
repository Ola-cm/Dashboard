export default function DaysSinceConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="days_since-label" className="block text-sm text-brown-600 mb-1">
          Label
        </label>
        <input
          id="days_since-label"
          type="text"
          value={value.label || ''}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          placeholder="e.g. Since we launched"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="days_since-start_date" className="block text-sm text-brown-600 mb-1">
          Start date
        </label>
        <input
          id="days_since-start_date"
          type="date"
          value={value.start_date || ''}
          onChange={(e) => onChange({ ...value, start_date: e.target.value })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
