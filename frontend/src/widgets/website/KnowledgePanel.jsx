import { useState } from 'react';
import WidgetFrame from '../WidgetFrame';

const FACT_ROWS = { square: 2, wide: 3, tall: 8, large: 8 };

export default function KnowledgePanel({ data, fetchedAt, size }) {
  const [imageFailed, setImageFailed] = useState(false);
  const tallEnough = size === 'tall' || size === 'large';

  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <div className="flex h-full flex-col gap-2 overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-display text-base font-semibold leading-tight text-brown-800">
                {d.title}
              </p>
              {d.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-brown-400">{d.description}</p>
              )}
            </div>
            {d.imageUrl && !imageFailed && (
              <img
                src={d.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="h-12 w-12 shrink-0 rounded-lg bg-white/70 object-contain p-1"
              />
            )}
          </div>

          {d.extract && (
            <p className={`${tallEnough ? 'line-clamp-6' : 'line-clamp-3'} text-xs text-brown-600`}>
              {d.extract}
            </p>
          )}

          {d.facts.length > 0 && (
            <dl className="space-y-1 border-t border-brown-200/60 pt-2 text-xs">
              {d.facts.slice(0, FACT_ROWS[size] ?? 3).map((fact) => (
                <div key={fact.label} className="flex gap-2">
                  <dt className="shrink-0 font-medium text-brown-800">{fact.label}</dt>
                  <dd className="truncate text-brown-500">{fact.values.join(', ')}</dd>
                </div>
              ))}
            </dl>
          )}

          <a
            href={d.pageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-auto text-xs font-medium text-brown-600 hover:underline"
          >
            Wikipedia &#8599;
          </a>
        </div>
      )}
    </WidgetFrame>
  );
}
