import WidgetFrame from '../WidgetFrame';

export default function Profile({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <div className="flex h-full items-center gap-3">
          <img
            src={d.avatarUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full border border-card-2/60 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-brown-800">{d.displayName}</p>
            <p className="truncate text-xs text-brown-400">@{d.username}</p>
          </div>
        </div>
      )}
    </WidgetFrame>
  );
}
