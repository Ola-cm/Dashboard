import WidgetFrame from '../WidgetFrame';

export default function Checklist({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) =>
        d.items.length === 0 ? (
          <p className="text-sm text-brown-400">No items yet.</p>
        ) : (
          <div>
            {d.title && <p className="mb-1 text-sm font-medium text-brown-800">{d.title}</p>}
            <ul className="space-y-1 text-sm text-brown-600">
              {d.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-olive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )
      }
    </WidgetFrame>
  );
}
