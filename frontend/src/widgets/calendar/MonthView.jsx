import WidgetFrame from '../WidgetFrame';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MonthView({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <div>
          <p className="mb-2 text-center text-sm font-medium text-brown-800">
            {d.monthName} {d.year}
          </p>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className="text-brown-400">
                {label}
              </span>
            ))}
            {d.weeks.flat().map((day, i) => (
              <span
                key={i}
                className={`rounded py-0.5 text-xs ${
                  day === null
                    ? ''
                    : day === d.today
                      ? 'bg-brown-600 font-semibold text-cream'
                      : 'text-brown-700'
                }`}
              >
                {day ?? ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </WidgetFrame>
  );
}
