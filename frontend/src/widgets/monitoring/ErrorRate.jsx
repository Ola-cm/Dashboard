import WidgetFrame from '../WidgetFrame';

export default function ErrorRate({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.url}</p>
          <p
            className={`text-3xl font-bold ${d.errorRatePercent > 0 ? 'text-red-600' : 'text-olive'}`}
          >
            {d.errorRatePercent}%
          </p>
          <p className="text-xs text-brown-400">
            {d.errorCount}/{d.samples} errored · last {d.timeRange}
          </p>
        </>
      )}
    </WidgetFrame>
  );
}
