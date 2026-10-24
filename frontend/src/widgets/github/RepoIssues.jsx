import WidgetFrame from '../WidgetFrame';

export default function RepoIssues({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(issues) =>
        issues.length === 0 ? (
          <p className="text-sm text-olive">No open issues.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {issues.map((issue) => (
              <li key={issue.number} className="border-b border-card-2 pb-1 last:border-0">
                <p className="truncate text-brown-800">
                  #{issue.number} {issue.title}
                </p>
                <p className="text-xs text-brown-400">{issue.author}</p>
              </li>
            ))}
          </ul>
        )
      }
    </WidgetFrame>
  );
}
