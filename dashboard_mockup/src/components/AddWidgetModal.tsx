import { useState } from "react";
import type { WidgetConfig } from "../pages/DashboardPage";

interface Props {
  onClose: () => void;
  onAdd: (widget: WidgetConfig) => void;
}

const WIDGET_TYPES = [
  { type: "weather", icon: "🌤", name: "Météo", desc: "Prévisions météo par ville", service: "Météo (défaut)", available: true },
  { type: "github", icon: "🐙", name: "GitHub", desc: "Heatmap de contributions & commits", service: "GitHub", available: true },
  { type: "rss", icon: "📰", name: "Flux RSS", desc: "Articles depuis n'importe quel flux RSS", service: "RSS (défaut)", available: true },
  { type: "stock", icon: "📈", name: "Bourse", desc: "Cours et graphiques financiers", service: "Finance (défaut)", available: true },
  { type: "steam", icon: "🎮", name: "Steam", desc: "Jeu en cours & temps de jeu", service: "Steam", available: true },
  { type: "map", icon: "🗺", name: "Carte & Trajet", desc: "Itinéraire et temps de trajet", service: "Maps (défaut)", available: true },
] as const;

type WidgetType = typeof WIDGET_TYPES[number]["type"];

const REFRESH_OPTIONS = [
  { label: "30 secondes", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "15 minutes", value: 900 },
  { label: "1 heure", value: 3600 },
];

const WIDGET_FIELDS: Record<WidgetType, { key: string; label: string; placeholder: string; type?: string }[]> = {
  weather: [
    { key: "city", label: "Ville", placeholder: "Paris, Tokyo, New York…" },
    { key: "unit", label: "Unité", placeholder: "°C ou °F" },
  ],
  github: [
    { key: "username", label: "Nom d'utilisateur GitHub", placeholder: "octocat" },
  ],
  rss: [
    { key: "url", label: "URL du flux RSS", placeholder: "https://blog.example.com/feed.xml" },
    { key: "count", label: "Nombre d'articles", placeholder: "5", type: "number" },
  ],
  stock: [
    { key: "ticker", label: "Ticker 1", placeholder: "AAPL, BTC, ETH…" },
    { key: "ticker2", label: "Ticker 2 (optionnel)", placeholder: "NVDA, SOL…" },
  ],
  steam: [
    { key: "game", label: "Nom du jeu (ou profil Steam)", placeholder: "Hollow Knight" },
  ],
  map: [
    { key: "from", label: "Départ", placeholder: "Paris 11e, Bordeaux…" },
    { key: "to", label: "Arrivée", placeholder: "La Défense, Lyon Part-Dieu…" },
  ],
};

export default function AddWidgetModal({ onClose, onAdd }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [refresh, setRefresh] = useState(300);
  const [title, setTitle] = useState("");

  const handleSelectType = (type: WidgetType) => {
    setSelectedType(type);
    const info = WIDGET_TYPES.find(w => w.type === type)!;
    setTitle(info.name);
    setFieldValues({});
    setStep(2);
  };

  const handleAdd = () => {
    if (!selectedType) return;
    const config: Record<string, string | number> = {};
    WIDGET_FIELDS[selectedType].forEach(f => {
      config[f.key] = f.type === "number" ? Number(fieldValues[f.key] || 5) : (fieldValues[f.key] || "");
    });
    onAdd({
      id: "",
      type: selectedType,
      title,
      config,
      refresh,
      size: selectedType === "github" ? "large" : selectedType === "weather" || selectedType === "steam" ? "small" : "medium",
    });
  };

  const selected = selectedType ? WIDGET_TYPES.find(w => w.type === selectedType) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(42,29,20,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: 520,
          background: "#F5EFE6",
          boxShadow: "0 24px 64px rgba(42,29,20,0.25)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E8DCC8" }}>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(s => (s > 1 ? (s - 1 as 1 | 2 | 3) : 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors"
                style={{ color: "#8B5A2B" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#3B2A1E" }}>Ajouter un widget</h2>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#A97040" }}>
                Étape {step} / 3 — {step === 1 ? "Choisir le type" : step === 2 ? "Configuration" : "Rafraîchissement"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors" style={{ color: "#A97040" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 h-1 rounded-full" style={{ background: step >= s ? "#6B4423" : "#E8DCC8" }} />
          ))}
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2.5">
              {WIDGET_TYPES.map(w => (
                <button
                  key={w.type}
                  onClick={() => handleSelectType(w.type)}
                  className="flex flex-col items-start p-3.5 rounded-xl text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: selectedType === w.type ? "rgba(107,68,35,0.1)" : "rgba(232,220,200,0.5)",
                    border: selectedType === w.type ? "1.5px solid #8B5A2B" : "1.5px solid rgba(255,255,255,0.6)",
                  }}
                >
                  <span style={{ fontSize: 24, marginBottom: 6 }}>{w.icon}</span>
                  <span className="font-semibold text-sm" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{w.name}</span>
                  <span className="text-xs mt-0.5" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{w.desc}</span>
                  <span
                    className="text-xs mt-2 px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(122,140,92,0.15)", color: "#7A8C5C", fontFamily: "var(--font-ui)" }}
                  >
                    {w.service}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 p-3 rounded-xl mb-4" style={{ background: "rgba(107,68,35,0.06)" }}>
                <span style={{ fontSize: 24 }}>{selected.icon}</span>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{selected.name}</div>
                  <div className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{selected.service}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>Titre du widget</label>
                <input
                  className="input-field"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={selected.name}
                />
              </div>

              {WIDGET_FIELDS[selected.type].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>{field.label}</label>
                  <input
                    className="input-field"
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={fieldValues[field.key] || ""}
                    onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                  />
                </div>
              ))}

              <button className="btn-primary w-full mt-2" onClick={() => setStep(3)}>
                Suivant →
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm mb-4" style={{ color: "#8B6A4A", fontFamily: "var(--font-ui)" }}>
                À quelle fréquence ce widget doit-il se rafraîchir automatiquement ?
              </p>
              <div className="space-y-2 mb-6">
                {REFRESH_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setRefresh(opt.value)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: refresh === opt.value ? "rgba(107,68,35,0.1)" : "rgba(232,220,200,0.4)",
                      border: refresh === opt.value ? "1.5px solid #8B5A2B" : "1.5px solid rgba(255,255,255,0.5)",
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{opt.label}</span>
                    {refresh === opt.value && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#6B4423" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                ))}
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleAdd}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Ajouter au dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
