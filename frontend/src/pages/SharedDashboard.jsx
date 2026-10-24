import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as shareApi from '../api/share';
import { getWidgetComponents } from '../widgets/registry';

const SIZE_WIDTH = { square: 240, wide: 480, tall: 240, large: 480 };

function SharedWidgetCard({ widget }) {
  const components = getWidgetComponents(widget.serviceName, widget.widgetName);
  const Display = components?.Display;

  return (
    <div
      className={`widget-card relative overflow-hidden lg:absolute lg:left-[var(--widget-x)] lg:top-[var(--widget-y)] lg:w-[var(--widget-w)] ${
        widget.size === 'wide' || widget.size === 'large' ? 'sm:col-span-2 lg:col-span-1' : ''
      }`}
      style={{
        '--widget-x': `${widget.position?.x ?? 0}px`,
        '--widget-y': `${widget.position?.y ?? 0}px`,
        '--widget-w': `${SIZE_WIDTH[widget.size] ?? SIZE_WIDTH.square}px`,
      }}
    >
      <div className="flex items-center gap-2 border-b border-brown-200/60 px-3 py-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brown-600/10 text-[11px] font-semibold uppercase text-brown-600">
          {widget.serviceName.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brown-800">{widget.widgetName}</p>
          <p className="truncate text-[11px] text-brown-400">{widget.serviceName}</p>
        </div>
      </div>
      <div className="p-3">
        {Display ? (
          <Display data={widget.data} fetchedAt={widget.fetchedAt} size={widget.size} />
        ) : (
          <p className="p-3 text-sm text-brown-400">
            No display registered yet for {widget.serviceName}:{widget.widgetName}.
          </p>
        )}
        {widget.error && (
          <p className="mt-2 rounded-md border border-terracotta/30 bg-terracotta-pale/50 px-2 py-1 text-xs text-terracotta">
            {widget.error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SharedDashboard() {
  const { token } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    shareApi
      .getSharedDashboard(token)
      .then(setDashboard)
      .catch((err) => {
        setError(
          err.response?.status === 404
            ? "This dashboard isn't shared (anymore)."
            : 'Could not load this dashboard, please try again.',
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Narrow screens stack the cards, so keep the order they have on the owner's canvas.
  const orderedWidgets = useMemo(
    () =>
      [...(dashboard?.widgets ?? [])].sort(
        (a, b) =>
          (a.position?.y ?? 0) - (b.position?.y ?? 0) ||
          (a.position?.x ?? 0) - (b.position?.x ?? 0),
      ),
    [dashboard],
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen">
      <header className="topbar sticky top-0 z-10 flex items-center justify-between border-b border-card-2/60 gap-3 px-4 py-3 lg:px-6 lg:py-4">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-semibold text-brown-800">
            {dashboard ? `${dashboard.owner.name}'s dashboard` : 'Shared dashboard'}
          </h1>
          <p className="text-xs text-brown-400">Read-only — shared publicly</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="shrink-0 rounded-lg border border-card-2/60 px-3 py-1.5 text-sm font-medium text-brown-600 hover:bg-brown-600/10"
        >
          Refresh
        </button>
      </header>

      <main className="relative min-h-[calc(100vh-73px)] w-full px-4 py-6 lg:px-6 lg:py-8">
        {error && (
          <p
            role="alert"
            className="mx-auto max-w-md rounded-lg border border-terracotta/30 bg-terracotta-pale/60 px-3 py-2 text-center text-sm text-terracotta"
          >
            {error}
          </p>
        )}

        {loading && !dashboard && <p className="text-brown-400">Loading...</p>}

        {dashboard && dashboard.widgets.length === 0 && (
          <p className="text-brown-400">This dashboard doesn&apos;t have any widgets yet.</p>
        )}

        {dashboard && dashboard.widgets.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:relative lg:block lg:min-h-full">
            {orderedWidgets.map((widget) => (
              <SharedWidgetCard key={widget.id} widget={widget} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
