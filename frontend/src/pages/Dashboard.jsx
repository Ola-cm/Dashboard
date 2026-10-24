import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAbout } from '../api/about';
import * as dashboardApi from '../api/dashboard';
import WidgetCard from '../components/WidgetCard';
import WidgetFormModal from '../components/WidgetFormModal';
import AppShell from '../components/AppShell';
import { useConfirm } from '../hooks/useConfirm';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const { confirm, confirmDialog } = useConfirm();
  const canvasRef = useRef(null);

  const [catalogue, setCatalogue] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMode, setModalMode] = useState(null); // null | 'add' | widget-being-edited
  const dragOffset = useRef({ x: 0, y: 0 });

  // On narrow screens the cards flow in a grid instead of sitting at their saved coordinates, so
  // keep the reading order the user laid out on the canvas: top to bottom, then left to right.
  const orderedWidgets = useMemo(
    () =>
      [...widgets].sort(
        (a, b) =>
          (a.position?.y ?? 0) - (b.position?.y ?? 0) ||
          (a.position?.x ?? 0) - (b.position?.x ?? 0),
      ),
    [widgets],
  );

  useEffect(() => {
    Promise.all([getAbout(), dashboardApi.listWidgets()])
      .then(([about, list]) => {
        setCatalogue(about.server.services);
        setWidgets(list);
      })
      .catch(() => setError('Could not load the dashboard, please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = useCallback((event, widget) => {
    const rect = event.currentTarget.parentElement.getBoundingClientRect();
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.dataTransfer.setData('text/plain', widget.id);
  }, []);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    if (!id) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: Math.max(0, event.clientX - canvasRect.left - dragOffset.current.x),
      y: Math.max(0, event.clientY - canvasRect.top - dragOffset.current.y),
    };

    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)));
    try {
      await dashboardApi.updateWidget(id, { position });
    } catch {
      setError('Could not save the new widget position.');
    }
  }, []);

  const handleResize = useCallback(async (widget, size) => {
    setWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, size } : w)));
    try {
      await dashboardApi.updateWidget(widget.id, { size });
    } catch {
      setError('Could not resize the widget.');
    }
  }, []);

  async function handleAdd(payload) {
    const created = await dashboardApi.createWidget(payload);
    setWidgets((prev) => [...prev, created]);
    setModalMode(null);
  }

  async function handleEditSubmit(payload) {
    const updated = await dashboardApi.updateWidget(modalMode.id, payload);
    setWidgets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setModalMode(null);
  }

  async function handleDelete(widget) {
    const confirmed = await confirm({
      title: 'Remove this widget?',
      message: `The "${widget.widgetName}" widget will be removed from your dashboard.`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!confirmed) return;
    setWidgets((prev) => prev.filter((w) => w.id !== widget.id));
    try {
      await dashboardApi.deleteWidget(widget.id);
    } catch {
      setError('Could not delete the widget.');
    }
  }

  return (
    <AppShell
      title={`Dashboard de ${user.name}`}
      actions={
        <button
          type="button"
          onClick={() => setModalMode('add')}
          className="whitespace-nowrap rounded-lg bg-brown-600 px-3 py-1.5 text-sm font-medium text-cream shadow shadow-brown-900/20 hover:bg-brown-500 sm:px-3.5"
        >
          + Add<span className="hidden sm:inline">&nbsp;widget</span>
        </button>
      }
    >
      {error && (
        <p
          role="alert"
          className="mx-4 mt-4 rounded-lg lg:mx-6 border border-terracotta/30 bg-terracotta-pale/60 px-3 py-2 text-sm text-terracotta"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="px-4 py-8 text-brown-400 lg:px-6">Loading your dashboard...</p>
      ) : (
        <div
          ref={canvasRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="grid w-full grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:relative lg:block lg:min-h-full lg:p-0"
        >
          {widgets.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 p-10 text-center lg:p-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-brown-200 text-xl text-brown-300">
                +
              </div>
              <p className="font-display text-lg text-brown-700">Your dashboard is empty</p>
              <p className="max-w-xs text-sm text-brown-400">
                Click &quot;Add widget&quot; above to pick a service and start building.
              </p>
            </div>
          )}
          {orderedWidgets.map((widget) => (
            <WidgetCard
              // The widget type is part of the key so swapping it from the Edit modal remounts
              // the card: the new Display must never be handed the previous widget's data.
              key={`${widget.id}:${widget.serviceName}:${widget.widgetName}`}
              widget={widget}
              onDragStart={handleDragStart}
              onEdit={setModalMode}
              onDelete={handleDelete}
              onResize={handleResize}
            />
          ))}
        </div>
      )}

      {modalMode && (
        <WidgetFormModal
          catalogue={catalogue}
          editingWidget={modalMode === 'add' ? null : modalMode}
          onClose={() => setModalMode(null)}
          onSubmit={modalMode === 'add' ? handleAdd : handleEditSubmit}
        />
      )}
      {confirmDialog}
    </AppShell>
  );
}
