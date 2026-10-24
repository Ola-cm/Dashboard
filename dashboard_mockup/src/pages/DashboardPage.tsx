import { useState } from "react";
import type { Screen } from "../App";
import AddWidgetModal from "../components/AddWidgetModal";
import WeatherWidget from "../components/widgets/WeatherWidget";
import GitHubWidget from "../components/widgets/GitHubWidget";
import RSSWidget from "../components/widgets/RSSWidget";
import StockWidget from "../components/widgets/StockWidget";
import SteamWidget from "../components/widgets/SteamWidget";
import MapWidget from "../components/widgets/MapWidget";

export interface WidgetConfig {
  id: string;
  type: "weather" | "github" | "rss" | "stock" | "steam" | "map";
  title: string;
  config: Record<string, string | number>;
  refresh: number;
  size: "small" | "medium" | "large";
}

const INITIAL_WIDGETS: WidgetConfig[] = [
  { id: "w1", type: "weather", title: "Météo Paris", config: { city: "Paris", unit: "°C" }, refresh: 300, size: "small" },
  { id: "w2", type: "weather", title: "Météo Tokyo", config: { city: "Tokyo", unit: "°C" }, refresh: 300, size: "small" },
  { id: "w3", type: "github", title: "GitHub", config: { username: "camilledurand" }, refresh: 60, size: "large" },
  { id: "w4", type: "rss", title: "Le Monde Tech", config: { url: "https://lemonde.fr/rss", count: 5 }, refresh: 600, size: "medium" },
  { id: "w5", type: "stock", title: "Bourse", config: { ticker: "AAPL", ticker2: "BTC" }, refresh: 60, size: "medium" },
  { id: "w6", type: "steam", title: "Steam", config: { game: "Hollow Knight" }, refresh: 300, size: "small" },
  { id: "w7", type: "map", title: "Trajet domicile", config: { from: "Paris 11e", to: "La Défense" }, refresh: 900, size: "medium" },
];

interface Props {
  onNavigate: (s: Screen) => void;
}

export default function DashboardPage({ onNavigate }: Props) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(INITIAL_WIDGETS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dashboardName, setDashboardName] = useState("Mon dashboard principal");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const removeWidget = (id: string) => {
    setWidgets(w => w.filter(x => x.id !== id));
    setMenuOpen(null);
  };

  const addWidget = (widget: WidgetConfig) => {
    setWidgets(w => [...w, { ...widget, id: `w${Date.now()}` }]);
    setShowAddModal(false);
  };

  const isEmpty = widgets.length === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1440, margin: "0 auto" }}>
      {/* Dashboard header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={dashboardName}
            onChange={e => setDashboardName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none outline-none cursor-pointer"
            style={{ fontFamily: "var(--font-display)", color: "#3B2A1E", fontSize: 20 }}
          >
            <option>Mon dashboard principal</option>
            <option>Work</option>
            <option>Loisirs</option>
          </select>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(107,68,35,0.1)", color: "#6B4423", fontFamily: "var(--font-ui)" }}
          >
            {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ServiceBadges onManage={() => onNavigate("services")} />
          <button
            className="btn-primary flex items-center gap-2 text-sm"
            onClick={() => setShowAddModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Ajouter un widget
          </button>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState onAdd={() => setShowAddModal(true)} />
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {widgets.map(widget => (
            <WidgetShell
              key={widget.id}
              widget={widget}
              menuOpen={menuOpen === widget.id}
              onMenuToggle={() => setMenuOpen(menuOpen === widget.id ? null : widget.id)}
              onRemove={() => removeWidget(widget.id)}
              onMenuClose={() => setMenuOpen(null)}
              size={widget.size}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddWidgetModal onClose={() => setShowAddModal(false)} onAdd={addWidget} />
      )}
    </div>
  );
}

function ServiceBadges({ onManage }: { onManage: () => void }) {
  const services = [
    { icon: "🌤", label: "Météo" },
    { icon: <GitHubIcon />, label: "GitHub" },
    { icon: "📰", label: "RSS" },
    { icon: "🎮", label: "Steam" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {services.map(s => (
        <button
          key={s.label}
          onClick={onManage}
          title={s.label}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-colors"
          style={{ background: "rgba(216,195,165,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}
        >
          {typeof s.icon === "string" ? s.icon : s.icon}
        </button>
      ))}
      <button
        onClick={onManage}
        className="text-xs px-2.5 py-1 rounded-lg"
        style={{ background: "rgba(216,195,165,0.5)", color: "#8B5A2B", border: "1px solid rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)" }}
      >
        +2
      </button>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B4423">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function WidgetShell({
  widget, menuOpen, onMenuToggle, onRemove, onMenuClose, size,
}: {
  widget: WidgetConfig;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onRemove: () => void;
  onMenuClose: () => void;
  size: string;
}) {
  const colSpan = size === "large" ? "sm:col-span-2" : size === "small" ? "" : "";

  return (
    <div
      className={`widget-card flex flex-col ${colSpan}`}
      onClick={menuOpen ? onMenuClose : undefined}
    >
      {/* Widget header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <WidgetIcon type={widget.type} />
          <span className="text-sm font-semibold" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{widget.title}</span>
        </div>
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); onMenuToggle(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ color: "#A97040" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-9 rounded-xl shadow-lg z-20 py-1 min-w-max"
              style={{ background: "#EDE4D6", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 24px rgba(107,68,35,0.15)" }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left hover:bg-black/5 transition-colors"
                style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Configurer
              </button>
              <button
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left hover:bg-black/5 transition-colors"
                style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Rafraîchir
              </button>
              <div className="my-1 mx-3 h-px" style={{ background: "#D8C3A5" }} />
              <button
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left hover:bg-red-50 transition-colors"
                style={{ color: "#C4622D", fontFamily: "var(--font-ui)" }}
                onClick={onRemove}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Widget content */}
      <div className="flex-1 px-4 pb-2">
        {widget.type === "weather" && <WeatherWidget config={widget.config} />}
        {widget.type === "github" && <GitHubWidget config={widget.config} />}
        {widget.type === "rss" && <RSSWidget config={widget.config} />}
        {widget.type === "stock" && <StockWidget config={widget.config} />}
        {widget.type === "steam" && <SteamWidget config={widget.config} />}
        {widget.type === "map" && <MapWidget config={widget.config} />}
      </div>

      {/* Widget footer */}
      <div className="px-4 pb-3 pt-1 flex items-center justify-between">
        <span className="text-xs" style={{ color: "#C49060", fontFamily: "var(--font-ui)" }}>
          Màj toutes les {widget.refresh >= 3600 ? `${widget.refresh / 3600}h` : widget.refresh >= 60 ? `${widget.refresh / 60}min` : `${widget.refresh}s`}
        </span>
        <button className="text-xs font-medium" style={{ color: "#8B5A2B", fontFamily: "var(--font-ui)" }}>Voir plus →</button>
      </div>
    </div>
  );
}

function WidgetIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    weather: <span style={{ fontSize: 18 }}>🌤</span>,
    github: <svg width="18" height="18" viewBox="0 0 24 24" fill="#6B4423"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>,
    rss: <span style={{ fontSize: 18 }}>📰</span>,
    stock: <span style={{ fontSize: 18 }}>📈</span>,
    steam: <span style={{ fontSize: 18 }}>🎮</span>,
    map: <span style={{ fontSize: 18 }}>🗺</span>,
  };
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(107,68,35,0.08)" }}>
      {icons[type]}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-24 px-6 rounded-2xl"
      style={{ border: "2px dashed #D8C3A5" }}
    >
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(107,68,35,0.07)" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#C49060" strokeWidth="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#C49060" strokeWidth="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#C49060" strokeWidth="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#C49060" strokeWidth="1.5"/>
        </svg>
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#3B2A1E", marginBottom: 8 }}>
        Votre dashboard est vide
      </h3>
      <p className="mb-8 max-w-sm" style={{ color: "#8B6A4A", fontSize: 14, lineHeight: 1.6, fontFamily: "var(--font-ui)" }}>
        Ajoutez votre premier widget pour commencer à personnaliser votre tableau de bord.
      </p>
      <button className="btn-primary flex items-center gap-2" onClick={onAdd}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        Ajouter votre premier widget
      </button>
    </div>
  );
}
