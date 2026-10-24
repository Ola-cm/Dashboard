import { useEffect, useRef, useState } from 'react';

// Shared shell every widget's Display component renders into. Centralizes the one concept
// that's the same for every widget regardless of service — shape/size, the "no data yet" state,
// and the last-updated timestamp — so adding a new service never means re-implementing it.
export const WIDGET_SIZES = [
  { id: 'square', label: 'Square', w: 1, h: 1 },
  { id: 'wide', label: 'Wide', w: 2, h: 1 },
  { id: 'tall', label: 'Tall', w: 1, h: 2 },
  { id: 'large', label: 'Large', w: 2, h: 2 },
];

const ASPECT_CLASS = {
  square: 'aspect-square',
  // The tall/wide shapes only make sense on the free-form desktop canvas; on narrow screens a
  // full-width card would be either a skyscraper or too short for its content.
  wide: 'aspect-square sm:aspect-[2/1]',
  tall: 'aspect-square lg:aspect-[1/2]',
  large: 'aspect-square',
};

export default function WidgetFrame({ size = 'square', data, fetchedAt, children }) {
  // Fades the content in only the first time data arrives for this instance — the Timer can
  // refresh a widget many times a day, and re-animating on every refresh would fail the same
  // frequency gate that keeps hover/press effects subtle instead of distracting.
  const hasAnimated = useRef(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (data && !hasAnimated.current) {
      hasAnimated.current = true;
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [data]);

  return (
    <div className={`flex h-full w-full flex-col ${ASPECT_CLASS[size] || ASPECT_CLASS.square}`}>
      <div
        className={`flex-1 overflow-hidden transition-opacity duration-200 ease-[var(--ease-out)] motion-safe:transition-[opacity,transform] ${
          !data || entered
            ? 'opacity-100 motion-safe:translate-y-0'
            : 'opacity-0 motion-safe:translate-y-1'
        }`}
      >
        {data ? children(data) : <p className="text-sm text-brown-400">No data yet.</p>}
      </div>
      {fetchedAt && (
        <p className="mt-2 text-xs text-brown-300">
          Updated {new Date(fetchedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
