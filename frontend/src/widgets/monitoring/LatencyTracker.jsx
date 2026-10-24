import WidgetFrame from '../WidgetFrame';

// A plain inline SVG polyline — the project has no charting library, and a sparkline over a
// handful of samples doesn't need one.
function Sparkline({ samples }) {
  const values = samples.map((s) => s.responseTimeMs);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * 100;
      const y = 28 - ((v - min) / range) * 26;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-10 w-full text-brown-500">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function LatencyTracker({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.url}</p>
          <p className="text-3xl font-bold text-brown-800">{d.lastMs} ms</p>
          <Sparkline samples={d.samples} />
        </>
      )}
    </WidgetFrame>
  );
}
