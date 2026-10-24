import WidgetFrame from '../WidgetFrame';

export default function ResponseTime({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.url}</p>
          <p className="text-3xl font-bold text-brown-800">{d.avgMs} ms</p>
          <p className="text-xs text-brown-400">
            min {d.minMs} · max {d.maxMs} · {d.upCount}/{d.samples} up
          </p>
        </>
      )}
    </WidgetFrame>
  );
}
