import { useEffect, useState } from 'react';

// Seconds left until the widget's next refresh. Ticks in its own component so only this label
// re-renders every second, not the whole widget card and its display.
export default function RefreshCountdown({ refreshRate, nextRefreshAt }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!nextRefreshAt) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [nextRefreshAt]);

  const secondsLeft = nextRefreshAt ? Math.max(0, Math.ceil((nextRefreshAt - now) / 1000)) : null;

  return (
    <>
      Refreshes every {refreshRate}s
      {secondsLeft !== null && (
        <span className="ml-auto tabular-nums" aria-label={`Next refresh in ${secondsLeft} seconds`}>
          next in {secondsLeft}s
        </span>
      )}
    </>
  );
}
