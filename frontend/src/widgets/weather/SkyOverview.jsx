import WidgetFrame from '../WidgetFrame';

export default function SkyOverview({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.city}</p>
          <p className="text-xl font-semibold capitalize text-brown-800">{d.description}</p>
          <p className="text-xs text-brown-400">
            Humidity {d.humidity}% · Wind {d.windSpeed} m/s
          </p>
        </>
      )}
    </WidgetFrame>
  );
}
