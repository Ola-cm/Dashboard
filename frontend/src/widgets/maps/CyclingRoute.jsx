import WidgetFrame from '../WidgetFrame';

export default function CyclingRoute({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">
            {d.origin} → {d.destination}
          </p>
          <p className="text-3xl font-bold text-brown-800">{d.distanceKm} km</p>
          <p className="text-xs text-brown-400">~{d.durationMin} min by bike</p>
        </>
      )}
    </WidgetFrame>
  );
}
