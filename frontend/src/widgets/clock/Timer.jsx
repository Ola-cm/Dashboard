import { useEffect, useRef, useState } from 'react';
import WidgetFrame from '../WidgetFrame';

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

// Unlike the other clock widgets, the timer's running state (counting down, paused, time left)
// only exists in this browser tab — the server just validates and stores the configured duration.
// Counting down from an absolute end timestamp rather than
// decrementing a counter every second keeps it accurate even if the tab is backgrounded and tick
// intervals get throttled.
export default function Timer({ data, fetchedAt, size }) {
  const [remaining, setRemaining] = useState(data?.durationSeconds ?? 0);
  const [running, setRunning] = useState(false);
  const endAtRef = useRef(null);

  // A new/edited config (different duration or label) always starts fresh, paused.
  useEffect(() => {
    setRunning(false);
    endAtRef.current = null;
    setRemaining(data?.durationSeconds ?? 0);
  }, [data?.durationSeconds, data?.label]);

  useEffect(() => {
    if (!running) return undefined;

    const id = setInterval(() => {
      const secondsLeft = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setRemaining(secondsLeft);
      if (secondsLeft === 0) {
        setRunning(false);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function handleStart() {
    if (remaining <= 0) return;
    endAtRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }

  function handlePause() {
    setRunning(false);
  }

  function handleReset() {
    setRunning(false);
    endAtRef.current = null;
    setRemaining(data?.durationSeconds ?? 0);
  }

  const finished = !running && data && remaining === 0;

  return (
    <WidgetFrame size={size} data={data} fetchedAt={fetchedAt}>
      {(d) => (
        <div className="flex h-full flex-col items-center justify-center text-center">
          {d.label && <p className="text-sm text-brown-600">{d.label}</p>}
          <p
            className={`font-display text-3xl font-bold tabular-nums ${
              finished ? 'text-terracotta' : 'text-brown-800'
            }`}
          >
            {formatDuration(remaining)}
          </p>
          <p className="mt-1 text-xs text-brown-400">
            {finished ? "Time's up!" : running ? 'Running' : 'Paused'}
          </p>
          <div className="mt-2 flex gap-1.5">
            {running ? (
              <button
                type="button"
                onClick={handlePause}
                className="rounded-md bg-brown-600/10 px-2.5 py-1 text-xs font-medium text-brown-700 hover:bg-brown-600/20"
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                disabled={remaining <= 0}
                className="rounded-md bg-brown-600/10 px-2.5 py-1 text-xs font-medium text-brown-700 hover:bg-brown-600/20 disabled:opacity-40"
              >
                Start
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-brown-500 hover:bg-brown-600/10"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </WidgetFrame>
  );
}
