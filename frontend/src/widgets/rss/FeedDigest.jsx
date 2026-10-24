import WidgetFrame from '../WidgetFrame';

export default function FeedDigest({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(items) =>
        items.length === 0 ? (
          <p className="text-sm text-brown-500">No items found.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {items.map((item) => (
              <li key={item.title} className="flex justify-between gap-2 text-brown-800">
                <span className="truncate">{item.title}</span>
                {item.publishedAt && (
                  <span className="shrink-0 text-xs text-brown-400">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )
      }
    </WidgetFrame>
  );
}
