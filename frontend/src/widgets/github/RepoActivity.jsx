import WidgetFrame from '../WidgetFrame';

export default function RepoActivity({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <>
          <p className="text-sm text-brown-500">{d.repo}</p>
          <p className="text-3xl font-bold text-brown-800">{d.commitCount}</p>
          <p className="text-xs text-brown-400">
            commit{d.commitCount > 1 ? 's' : ''} in the last {d.days} day{d.days > 1 ? 's' : ''}
          </p>
        </>
      )}
    </WidgetFrame>
  );
}
