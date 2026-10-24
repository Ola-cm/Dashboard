import { useEffect, useState } from 'react';
import * as servicesApi from '../api/services';
import AppShell from '../components/AppShell';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    servicesApi
      .getServices()
      .then(setServices)
      .catch(() => setError('Could not load services.'))
      .finally(() => setLoading(false));
  }, []);

  async function connectOAuth(name) {
    const url = await servicesApi.getOauthUrl(name);
    window.location.href = url;
  }

  async function disconnect(name) {
    setError(null);
    try {
      await servicesApi.unsubscribeFromService(name);
      setServices((prev) =>
        prev.map((s) => (s.name === name ? { ...s, subscribed: false, available: false } : s)),
      );
    } catch {
      setError(`Could not disconnect ${name}.`);
    }
  }

  async function subscribe(name) {
    await servicesApi.subscribeToService(name);
    window.location.reload();
  }

  return (
    <AppShell title="Services">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {loading && <p className="text-brown-400">Loading services...</p>}
        {error && (
          <p className="mb-4 rounded-lg border border-terracotta/30 bg-terracotta-pale/60 px-3 py-2 text-sm text-terracotta">
            {error}
          </p>
        )}
        <ul className="space-y-3">
          {services.map((service, index) => (
            <li
              key={service.name}
              style={{ animationDelay: `${index * 50}ms` }}
              className="glass flex items-center justify-between rounded-xl px-4 py-3.5 opacity-0 shadow-lg shadow-brown-900/10 [animation:fade-in-up_300ms_var(--ease-out)_forwards]"
            >
              <div>
                <p className="font-medium capitalize text-brown-800">{service.name}</p>
                <p className="text-xs text-brown-400">
                  {service.widgets.length} widget{service.widgets.length > 1 ? 's' : ''}
                </p>
              </div>
              {service.available && service.requiresAuth ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-olive-pale px-2.5 py-1 text-xs font-medium text-olive">
                    Connected
                  </span>
                  <button
                    onClick={() => disconnect(service.name)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-terracotta transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-terracotta-pale/60 active:scale-[0.97]"
                  >
                    Disconnect
                  </button>
                </div>
              ) : service.available ? (
                <span className="rounded-full bg-olive-pale px-2.5 py-1 text-xs font-medium text-olive">
                  Available
                </span>
              ) : service.requiresAuth ? (
                <button
                  onClick={() => connectOAuth(service.name)}
                  className="rounded-lg bg-brown-600 px-3.5 py-1.5 text-sm font-medium capitalize text-cream shadow shadow-brown-900/20 transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-brown-500 active:scale-[0.97]"
                >
                  Connect {service.name}
                </button>
              ) : (
                <button
                  onClick={() => subscribe(service.name)}
                  className="rounded-lg bg-brown-600 px-3.5 py-1.5 text-sm font-medium text-cream shadow shadow-brown-900/20 transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-brown-500 active:scale-[0.97]"
                >
                  Subscribe
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
