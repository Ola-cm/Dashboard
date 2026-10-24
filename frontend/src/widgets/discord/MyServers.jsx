import WidgetFrame from '../WidgetFrame';

function ServerIcon({ server }) {
  return server.iconUrl ? (
    <img src={server.iconUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
  ) : (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brown-600/10 text-xs font-medium text-brown-500">
      {server.name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function MyServers({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) =>
        d.servers.length === 0 ? (
          <p className="text-sm text-brown-400">This account is not in any server yet.</p>
        ) : (
          <div>
            <p className="mb-1 text-[11px] text-brown-400">{d.total} servers</p>
            <ul className="space-y-1.5">
              {d.servers.map((server) => (
                <li key={server.id} className="flex items-center gap-2">
                  <ServerIcon server={server} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-brown-800">{server.name}</p>
                    {server.memberCount !== null && (
                      <p className="text-[11px] text-brown-400">{server.memberCount} members</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      }
    </WidgetFrame>
  );
}
