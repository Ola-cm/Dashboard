import WidgetFrame from '../WidgetFrame';

export default function PrecipitationForecast({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">
            {d.city} · next {d.days} day{d.days > 1 ? 's' : ''}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {(d.slots || []).slice(0, 5).map((slot) => (
              <li key={slot.time} className="flex justify-between text-brown-600">
                <span>{slot.time}</span>
                <span>{Math.round(slot.precipitationProbability * 100)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </WidgetFrame>
  );
}
