export default function CountdownConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="countdown-label" className="block text-sm text-brown-600 mb-1">
          Label
        </label>
        <input
          id="countdown-label"
          type="text"
          value={value.label || ''}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          placeholder="e.g. Project deadline"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div>
        <label htmlFor="countdown-target_date" className="block text-sm text-brown-600 mb-1">
          Target date
        </label>
        <input
          id="countdown-target_date"
          type="date"
          value={value.target_date || ''}
          onChange={(e) => onChange({ ...value, target_date: e.target.value })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
