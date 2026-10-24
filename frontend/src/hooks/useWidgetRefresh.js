import { useEffect, useState } from 'react';
import { getWidgetData } from '../api/dashboard';

// The Timer: fetches a widget instance's data once on mount, then again every `refreshRate`
// seconds for as long as the card stays on screen. Each widget instance runs its own timer,
// as required by the spec ("each widget instance communicates its refresh rate to the Timer").
export function useWidgetRefresh(widgetId, refreshRateSeconds, configVersion) {
  const [data, setData] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [error, setError] = useState(null);
  const [nextRefreshAt, setNextRefreshAt] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const result = await getWidgetData(widgetId);
        if (cancelled) return;
        setData(result.data);
        setFetchedAt(result.fetchedAt);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Could not refresh this widget.');
        }
      }
    }

    // `nextRefreshAt` lets the card show a live countdown without owning a second timer.
    function scheduleTick() {
      setNextRefreshAt(Date.now() + refreshRateSeconds * 1000);
      tick();
    }

    scheduleTick();
    const interval = setInterval(scheduleTick, refreshRateSeconds * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [widgetId, refreshRateSeconds, configVersion]);

  return { data, fetchedAt, error, nextRefreshAt };
}
