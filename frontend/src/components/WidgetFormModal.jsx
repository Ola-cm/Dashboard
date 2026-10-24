import { useState } from 'react';
import { getWidgetComponents } from '../widgets/registry';
import { WIDGET_SIZES } from '../widgets/WidgetFrame';

const DEFAULT_REFRESH_RATE = 60;

export default function WidgetFormModal({ catalogue, editingWidget, onClose, onSubmit }) {
  const isEditing = Boolean(editingWidget);

  const [serviceName, setServiceName] = useState(editingWidget?.serviceName || '');
  const service = catalogue.find((s) => s.name === serviceName);

  const [widgetName, setWidgetName] = useState(editingWidget?.widgetName || '');
  const widgetDef = service?.widgets.find((w) => w.name === widgetName);
  const components = getWidgetComponents(serviceName, widgetName);

  const [config, setConfig] = useState(editingWidget?.config || {});
  const [size, setSize] = useState(editingWidget?.size || WIDGET_SIZES[0].id);
  const [refreshRate, setRefreshRate] = useState(
    editingWidget?.refreshRate ?? DEFAULT_REFRESH_RATE,
  );
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // While editing, the widget can be swapped for another one. Coming back to the widget being
  // edited restores its saved config; switching to any other widget keeps only the values of
  // params the new widget also has (e.g. `timezone` from one clock to the other) instead of
  // making the user retype them. The backend re-validates the result either way.
  function configFor(nextService, nextWidget) {
    if (editingWidget?.serviceName === nextService && editingWidget?.widgetName === nextWidget) {
      return editingWidget.config;
    }
    const nextDef = catalogue
      .find((s) => s.name === nextService)
      ?.widgets.find((w) => w.name === nextWidget);
    return Object.fromEntries(
      (nextDef?.params || [])
        .filter((param) => config[param.name] !== undefined)
        .map((param) => [param.name, config[param.name]]),
    );
  }

  function selectService(name) {
    setServiceName(name);
    setWidgetName('');
  }

  function selectWidget(name) {
    setWidgetName(name);
    setConfig(configFor(serviceName, name));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isEditing) {
        await onSubmit({ serviceName, widgetName, config, refreshRate, size });
      } else {
        await onSubmit({
          serviceName,
          widgetName,
          config,
          refreshRate,
          size,
          position: { x: 20, y: 20 },
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong, please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = Boolean(widgetDef && components?.Config);
  const inputClass =
    'w-full rounded-lg border border-brown-200 bg-white/60 px-3 py-2.5 text-brown-800 outline-none focus:border-brown-500 focus:ring-1 focus:ring-brown-500';
  const labelClass = 'mb-1.5 block text-sm font-medium text-brown-600';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="widget-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 px-4 py-6 backdrop-blur-sm"
    >
      <div className="my-auto w-full max-w-md rounded-2xl border border-white/80 bg-cream shadow-[0_24px_64px_rgba(42,29,20,0.25)]">
        <div className="border-b border-card-2/60 px-6 py-4">
          <h2
            id="widget-form-title"
            className="font-display text-base font-semibold text-brown-800"
          >
            {isEditing ? 'Reconfigure widget' : 'Add a widget'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5" noValidate>
          <div>
            <label htmlFor="service" className={labelClass}>
              Service
            </label>
            <select
              id="service"
              value={serviceName}
              onChange={(e) => selectService(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a service...</option>
              {catalogue.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {service && (
            <div>
              <label htmlFor="widget" className={labelClass}>
                Widget
              </label>
              <select
                id="widget"
                value={widgetName}
                onChange={(e) => selectWidget(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a widget...</option>
                {service.widgets.map((w) => (
                  <option key={w.name} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {components?.Config ? (
            <components.Config
              key={`${serviceName}:${widgetName}`}
              value={config}
              onChange={setConfig}
            />
          ) : (
            widgetDef && (
              <p className="rounded-lg border border-terracotta/30 bg-terracotta-pale/60 px-3 py-2 text-sm text-terracotta">
                No configuration form is registered yet for this widget.
              </p>
            )
          )}

          {canSubmit && (
            <>
              <div>
                <label htmlFor="size" className={labelClass}>
                  Size
                </label>
                <select
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={inputClass}
                >
                  {WIDGET_SIZES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="refreshRate" className={labelClass}>
                  Refresh rate (seconds)
                </label>
                <input
                  id="refreshRate"
                  type="number"
                  min={5}
                  required
                  value={refreshRate}
                  onChange={(e) => setRefreshRate(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-terracotta/30 bg-terracotta-pale/60 px-3 py-2 text-sm text-terracotta"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-card-2/60 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-brown-500 hover:bg-brown-600/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-lg bg-brown-600 px-4 py-2 text-sm font-medium text-cream shadow shadow-brown-900/20 hover:bg-brown-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Add widget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
