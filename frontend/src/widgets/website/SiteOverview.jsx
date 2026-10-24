import { useState } from 'react';
import WidgetFrame from '../WidgetFrame';

// Images come straight from the site being shown; no-referrer keeps it from learning which
// dashboard displays it.
function ExternalImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export default function SiteOverview({ data, fetchedAt, size }) {
  const roomy = size !== 'square';

  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <div className="flex h-full flex-col gap-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <ExternalImage src={d.iconUrl} alt="" className="h-5 w-5 shrink-0 rounded" />
            <p className="truncate text-sm font-semibold text-brown-800">{d.siteName || d.domain}</p>
            {d.language && (
              <span className="ml-auto shrink-0 rounded-full bg-brown-600/10 px-2 py-0.5 text-[10px] font-medium uppercase text-brown-600">
                {d.language}
              </span>
            )}
          </div>
          {roomy && (
            <ExternalImage
              src={d.imageUrl}
              alt={`Preview of ${d.domain}`}
              className="max-h-28 w-full rounded-lg object-cover"
            />
          )}
          {d.title && <p className="line-clamp-2 text-sm font-medium text-brown-800">{d.title}</p>}
          {d.description && (
            <p className={`${roomy ? 'line-clamp-4' : 'line-clamp-3'} text-xs text-brown-500`}>
              {d.description}
            </p>
          )}
          <a
            href={d.url}
            target="_blank"
            rel="noreferrer"
            className="mt-auto truncate text-xs font-medium text-brown-600 hover:underline"
          >
            {d.domain} &#8599;
          </a>
        </div>
      )}
    </WidgetFrame>
  );
}
