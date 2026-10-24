import WidgetFrame from '../WidgetFrame';

export default function PlaceLookup({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.displayName}</p>
          <p className="text-xs text-brown-400">
            {d.lat.toFixed(4)}, {d.lon.toFixed(4)}
          </p>
        </>
      )}
    </WidgetFrame>
  );
}
