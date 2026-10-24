import WidgetFrame from '../WidgetFrame';

export default function StickyNote({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <div>
          {d.title && <p className="mb-1 text-sm font-medium text-brown-800">{d.title}</p>}
          <p className="whitespace-pre-wrap text-sm text-brown-600">{d.content}</p>
        </div>
      )}
    </WidgetFrame>
  );
}
