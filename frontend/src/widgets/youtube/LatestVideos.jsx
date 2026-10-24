import WidgetFrame from '../WidgetFrame';

export default function LatestVideos({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) =>
        d.items.length === 0 ? (
          <p className="text-sm text-brown-500">Nothing published yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {d.items.map((item) => (
              <li key={item.url || item.title} className="border-b border-card-2 pb-1 last:border-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-brown-800 hover:underline"
                >
                  {item.title}
                </a>
                {item.date && (
                  <p className="text-xs text-brown-400">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )
      }
    </WidgetFrame>
  );
}
