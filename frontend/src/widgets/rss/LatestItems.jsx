import WidgetFrame from '../WidgetFrame';

export default function LatestItems({ data, fetchedAt, size }) {
  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(articles) =>
        articles.length === 0 ? (
          <p className="text-sm text-brown-500">No articles found.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {articles.map((article) => (
              <li key={article.link} className="border-b border-card-2 pb-1 last:border-0">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-brown-800 hover:underline"
                >
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        )
      }
    </WidgetFrame>
  );
}
