import WidgetFrame from '../WidgetFrame';

export default function UserRepositories({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(repos) =>
        repos.length === 0 ? (
          <p className="text-sm text-brown-500">No repositories found.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {repos.map((repo) => (
              <li key={repo.name} className="border-b border-card-2 pb-1 last:border-0">
                <p className="truncate text-brown-800">{repo.name}</p>
                <p className="text-xs text-brown-400">★ {repo.stars}</p>
              </li>
            ))}
          </ul>
        )
      }
    </WidgetFrame>
  );
}
