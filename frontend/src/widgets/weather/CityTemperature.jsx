import WidgetFrame from '../WidgetFrame';

export default function CityTemperature({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.city}</p>
          <p className="text-3xl font-bold text-brown-800">{Math.round(d.temperature)}°C</p>
          <p className="text-xs text-brown-400">Feels like {Math.round(d.feelsLike)}°C</p>
        </>
      )}
    </WidgetFrame>
  );
}
