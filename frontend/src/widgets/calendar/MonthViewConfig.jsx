const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function MonthViewConfig({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="month_view-month" className="block text-sm text-brown-600 mb-1">
          Month
        </label>
        <select
          id="month_view-month"
          value={value.month || ''}
          onChange={(e) => onChange({ ...value, month: Number(e.target.value) })}
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        >
          <option value="">Select a month...</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="month_view-year" className="block text-sm text-brown-600 mb-1">
          Year
        </label>
        <input
          id="month_view-year"
          type="number"
          value={value.year || ''}
          onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
          placeholder="e.g. 2026"
          className="w-full rounded-md bg-white/60 border border-brown-200 px-3 py-2 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
    </div>
  );
}
