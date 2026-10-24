import WidgetFrame from '../WidgetFrame';

export default function RecentCommits({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(commits) =>
        commits.length === 0 ? (
          <p className="text-sm text-brown-500">No commits found.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {commits.map((commit) => (
              <li key={commit.sha} className="border-b border-card-2 pb-1 last:border-0">
                <p className="truncate text-brown-800">{commit.message.split('\n')[0]}</p>
                <p className="text-xs text-brown-400">{commit.author}</p>
              </li>
            ))}
          </ul>
        )
      }
    </WidgetFrame>
  );
}
