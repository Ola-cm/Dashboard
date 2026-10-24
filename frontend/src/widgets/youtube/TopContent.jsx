import WidgetFrame from '../WidgetFrame';

export default function TopContent({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) =>
        d.items.length === 0 ? (
          <p className="text-sm text-brown-500">No data for this period.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {d.items.map((item) => (
              <li key={item.title} className="border-b border-card-2 pb-1 last:border-0">
                <p className="truncate text-brown-800">{item.title}</p>
                <p className="text-xs text-brown-400">{item.metric}</p>
              </li>
            ))}
          </ul>
        )
      }
    </WidgetFrame>
  );
}
