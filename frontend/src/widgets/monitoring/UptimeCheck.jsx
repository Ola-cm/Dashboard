import WidgetFrame from '../WidgetFrame';

export default function UptimeCheck({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.url}</p>
          <p className={`text-2xl font-bold ${d.up ? 'text-olive' : 'text-red-600'}`}>
            {d.up ? 'Up' : 'Down'}
          </p>
          <p className="text-xs text-brown-400">
            {d.statusCode ? `HTTP ${d.statusCode} · ` : ''}
            {d.responseTimeMs} ms
          </p>
        </>
      )}
    </WidgetFrame>
  );
}
