import { useMemo } from 'react';
import WidgetFrame from '../WidgetFrame';

// Countdown's mirror image: instead of counting down to a target date, this counts up from a
// start date. Same snapshot-at-last-fetch behaviour, just the other direction.
function diffParts(startDate, now) {
  const diffMs = now - new Date(startDate).getTime();
  const future = diffMs < 0;
  const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);
  return {
    future,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function DaysSince({ data, fetchedAt, size }) {
  // Measured at the moment the data was fetched, not at render time: the widget stays frozen
  // until the next refresh instead of ticking on its own.
  const parts = useMemo(
    () => (data ? diffParts(data.startDate, new Date(fetchedAt).getTime()) : null),
    [data, fetchedAt],
  );

  return (
    <WidgetFrame size={size} data={parts} fetchedAt={fetchedAt}>
      {() => (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="flex gap-2 font-display text-lg font-bold tabular-nums text-brown-800">
            <span>{parts.days}d</span>
            <span>{pad(parts.hours)}h</span>
            <span>{pad(parts.minutes)}m</span>
            <span>{pad(parts.seconds)}s</span>
          </div>
          <p className="mt-1 text-xs text-brown-400">{parts.future ? 'until it starts' : 'ago'}</p>
          <p className="mt-1 text-sm text-brown-600">{data.label}</p>
        </div>
      )}
    </WidgetFrame>
  );
}
