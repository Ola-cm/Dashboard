import WidgetFrame from '../WidgetFrame';

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function ChannelStats({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.name}</p>
          <p className="text-3xl font-bold text-brown-800">{formatCount(d.followers)}</p>
          <p className="text-xs text-brown-400">
            subscribers · {d.secondary.label.toLowerCase()} {formatCount(d.secondary.value)}
          </p>
        </>
      )}
    </WidgetFrame>
  );
}
