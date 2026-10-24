import { useCallback, useRef, useState } from 'react';
import { getWidgetComponents } from '../widgets/registry';
import { useWidgetRefresh } from '../hooks/useWidgetRefresh';
import RefreshCountdown from './RefreshCountdown';
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { IconResize } from './icons';

const SIZE_WIDTH = { square: 240, wide: 480, tall: 240, large: 480 };
const SIZE_UNITS = {
  square: { w: 1, h: 1 },
  wide: { w: 2, h: 1 },
  tall: { w: 1, h: 2 },
  large: { w: 2, h: 2 },
};
const UNITS_TO_SIZE = Object.fromEntries(
  Object.entries(SIZE_UNITS).map(([size, { w, h }]) => [`${w}x${h}`, size]),
);
// How far (in px) the pointer must move before a dimension flips to its other value — small
// enough to feel responsive, large enough that a drag isn't mistaken for a click.
const RESIZE_THRESHOLD = 50;
// Below the desktop breakpoint cards flow in a grid: wide/large ones take the full row of the
// two-column tablet layout.
const SPAN_CLASS = { wide: 'sm:col-span-2 lg:col-span-1', large: 'sm:col-span-2 lg:col-span-1' };

export default function WidgetCard({ widget, onDragStart, onEdit, onDelete, onResize }) {
  const components = getWidgetComponents(widget.serviceName, widget.widgetName);
  const Display = components?.Display;
  const { data, fetchedAt, error, nextRefreshAt } = useWidgetRefresh(
    widget.id,
    widget.refreshRate,
    JSON.stringify(widget.config),
  );

  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [previewSize, setPreviewSize] = useState(null);
  const resizingRef = useRef(false);
  const displaySize = previewSize || widget.size;

  const handleResizeStart = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      resizingRef.current = true;

      const startX = event.clientX;
      const startY = event.clientY;
      const startUnits = SIZE_UNITS[widget.size] || SIZE_UNITS.square;
      let finalSize = widget.size;

      function onMove(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const w = dx > RESIZE_THRESHOLD ? 2 : dx < -RESIZE_THRESHOLD ? 1 : startUnits.w;
        const h = dy > RESIZE_THRESHOLD ? 2 : dy < -RESIZE_THRESHOLD ? 1 : startUnits.h;
        const nextSize = UNITS_TO_SIZE[`${w}x${h}`];
        if (nextSize && nextSize !== finalSize) {
          finalSize = nextSize;
          setPreviewSize(nextSize);
        }
      }

      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        resizingRef.current = false;
        setPreviewSize(null);
        if (finalSize !== widget.size) {
          onResize(widget, finalSize);
        }
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [widget, onResize],
  );

  return (
    <div
      data-testid="widget-card"
      className={`widget-card relative overflow-hidden lg:absolute lg:left-[var(--widget-x)] lg:top-[var(--widget-y)] lg:w-[var(--widget-w)] ${
        SPAN_CLASS[displaySize] || ''
      }`}
      style={{
        '--widget-x': `${widget.position?.x ?? 0}px`,
        '--widget-y': `${widget.position?.y ?? 0}px`,
        '--widget-w': `${SIZE_WIDTH[displaySize] ?? SIZE_WIDTH.square}px`,
        transition: resizingRef.current ? 'none' : 'width 150ms ease-out',
      }}
    >
      <div
        draggable={isDesktop}
        onDragStart={(e) => onDragStart(e, widget)}
        className="flex items-center lg:cursor-move justify-between gap-2 border-b border-brown-200/60 px-3 py-2.5"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brown-600/10 text-[11px] font-semibold uppercase text-brown-600">
            {widget.serviceName.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-brown-800">{widget.widgetName}</p>
            <p className="truncate text-[11px] text-brown-400">{widget.serviceName}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label="Reconfigure widget"
            onClick={() => onEdit(widget)}
            className="rounded-md px-2 py-1.5 text-xs font-medium text-brown-500 lg:py-1 hover:bg-brown-600/10 hover:text-brown-700"
          >
            Edit
          </button>
          <button
            type="button"
            aria-label="Delete widget"
            onClick={() => onDelete(widget)}
            className="rounded-md px-2 py-1.5 text-xs font-medium text-terracotta lg:py-1 hover:bg-terracotta-pale/60"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="p-3">
        {Display ? (
          <Display data={data} fetchedAt={fetchedAt} size={displaySize} />
        ) : (
          <p className="p-3 text-sm text-brown-400">
            No display registered yet for {widget.serviceName}:{widget.widgetName}.
          </p>
        )}
        {error && (
          <p className="mt-2 rounded-md border border-terracotta/30 bg-terracotta-pale/50 px-2 py-1 text-xs text-terracotta">
            {error}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 border-t border-brown-200/60 px-3 py-1.5 text-[11px] text-brown-400">
        <span className="h-1.5 w-1.5 rounded-full bg-olive" />
        <RefreshCountdown refreshRate={widget.refreshRate} nextRefreshAt={nextRefreshAt} />
      </div>
      <div
        role="button"
        tabIndex={-1}
        aria-label="Resize widget"
        onPointerDown={handleResizeStart}
        className="absolute bottom-0 right-0 hidden h-6 w-6 cursor-nwse-resize lg:flex items-center justify-center rounded-tl-md text-brown-300 hover:text-brown-600"
      >
        <IconResize className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
