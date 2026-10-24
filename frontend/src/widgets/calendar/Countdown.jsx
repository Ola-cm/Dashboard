import { useMemo } from 'react';
import WidgetFrame from '../WidgetFrame';

// The server only resolves targetDate into a coarse daysRemaining figure. Since it's already
// sending us the exact target date, the fine-grained days/hours/minutes/seconds are worked out
// client-side, as of the last fetch.
function diffParts(targetDate, now) {
  const diffMs = new Date(targetDate).getTime() - now;
  const past = diffMs < 0;
  const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);
  return {
    past,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function Countdown({ data, fetchedAt, size }) {
  // Measured at the moment the data was fetched, not at render time: the widget stays frozen
  // until the next refresh instead of ticking on its own.
  const parts = useMemo(
    () => (data ? diffParts(data.targetDate, new Date(fetchedAt).getTime()) : null),
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
          <p className="mt-1 text-xs text-brown-400">{parts.past ? 'ago' : 'remaining'}</p>
          <p className="mt-1 text-sm text-brown-600">{data.label}</p>
        </div>
      )}
    </WidgetFrame>
  );
}
