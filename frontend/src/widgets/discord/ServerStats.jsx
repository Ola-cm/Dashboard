import WidgetFrame from '../WidgetFrame';

export default function ServerStats({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <div className="flex items-center gap-3">
          {d.iconUrl ? (
            <img src={d.iconUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brown-600/10 font-medium text-brown-500">
              {d.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-brown-800">{d.name}</p>
            {d.owner && <p className="text-[11px] text-olive">You own this server</p>}
            <div className="mt-1 flex gap-3 text-sm text-brown-600">
              {d.memberCount !== null && <span>{d.memberCount} members</span>}
              {d.onlineCount !== null && <span>{d.onlineCount} online</span>}
            </div>
          </div>
        </div>
      )}
    </WidgetFrame>
  );
}
