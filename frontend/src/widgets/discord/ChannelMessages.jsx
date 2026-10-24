import WidgetFrame from '../WidgetFrame';

export default function ChannelMessages({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) =>
        d.messages.length === 0 ? (
          <p className="text-sm text-brown-400">No messages in #{d.channelName} yet.</p>
        ) : (
          <div>
            <p className="mb-1 truncate text-[11px] text-brown-400">#{d.channelName}</p>
            <ul className="space-y-2">
              {d.messages.map((message) => (
                <li key={message.id} className="flex gap-2">
                  <img
                    src={message.avatarUrl}
                    alt=""
                    className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs">
                      <span className="font-medium text-brown-800">{message.author}</span>{' '}
                      <span className="text-brown-300">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                    <p className="break-words text-xs text-brown-600">
                      {message.content || (message.attachmentCount > 0 ? '' : '(no text)')}
                      {message.attachmentCount > 0 && (
                        <span className="text-brown-400">
                          {' '}
                          [{message.attachmentCount} attachment
                          {message.attachmentCount > 1 ? 's' : ''}]
                        </span>
                      )}
                    </p>
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
