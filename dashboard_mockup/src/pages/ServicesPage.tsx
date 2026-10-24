import { useState } from "react";

interface Service {
  id: string;
  name: string;
  icon: string;
  desc: string;
  status: "connected" | "available" | "disconnected";
  auth: "oauth" | "key" | "none";
  connectedAs?: string;
}

const SERVICES: Service[] = [
  { id: "weather", name: "Météo", icon: "🌤", desc: "Prévisions météo depuis OpenWeatherMap.", status: "connected", auth: "none", connectedAs: "Données publiques" },
  { id: "rss", name: "RSS", icon: "📰", desc: "Lisez n'importe quel flux RSS ou Atom.", status: "connected", auth: "none", connectedAs: "Données publiques" },
  { id: "finance", name: "Finance", icon: "📈", desc: "Cours boursiers et crypto en temps réel.", status: "connected", auth: "none", connectedAs: "API publique" },
  { id: "maps", name: "Google Maps", icon: "🗺", desc: "Calcul d'itinéraires et cartes interactives.", status: "connected", auth: "none", connectedAs: "Données publiques" },
  { id: "github", name: "GitHub", icon: "🐙", desc: "Contributions, commits, issues et pull requests.", status: "connected", auth: "oauth", connectedAs: "camilledurand" },
  { id: "steam", name: "Steam", icon: "🎮", desc: "Jeux récents, bibliothèque et succès.", status: "disconnected", auth: "key", },
  { id: "twitter", name: "Twitter / X", icon: "🐦", desc: "Fil d'actualité et mentions.", status: "disconnected", auth: "oauth" },
  { id: "spotify", name: "Spotify", icon: "🎵", desc: "Musique en cours, playlists et podcasts.", status: "disconnected", auth: "oauth" },
  { id: "notion", name: "Notion", icon: "📋", desc: "Pages récentes et bases de données.", status: "disconnected", auth: "oauth" },
  { id: "gmail", name: "Gmail", icon: "📧", desc: "Aperçu des e-mails non lus.", status: "disconnected", auth: "oauth" },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [connectModal, setConnectModal] = useState<Service | null>(null);

  const toggleConnect = (id: string) => {
    setServices(s => s.map(svc =>
      svc.id === id
        ? { ...svc, status: svc.status === "connected" ? "disconnected" : "connected", connectedAs: svc.status !== "connected" ? "Connecté" : undefined }
        : svc
    ));
    setConnectModal(null);
  };

  const connected = services.filter(s => s.status === "connected");
  const disconnected = services.filter(s => s.status !== "connected");

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="mb-8">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#3B2A1E", marginBottom: 4 }}>Services connectés</h1>
        <p style={{ color: "#8B6A4A", fontSize: 14, fontFamily: "var(--font-ui)" }}>
          Gérez les services dont vos widgets extraient les données.
        </p>
      </div>

      {/* Connected services */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#7A8C5C" }} />
          Connectés ({connected.length})
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {connected.map(svc => (
            <ServiceCard key={svc.id} service={svc} onDisconnect={() => toggleConnect(svc.id)} onConnect={() => setConnectModal(svc)} />
          ))}
        </div>
      </section>

      {/* Available services */}
      <section>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D8C3A5" }} />
          Disponibles ({disconnected.length})
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {disconnected.map(svc => (
            <ServiceCard key={svc.id} service={svc} onConnect={() => setConnectModal(svc)} />
          ))}
        </div>
      </section>

      {connectModal && (
        <ConnectModal
          service={connectModal}
          onClose={() => setConnectModal(null)}
          onConnect={() => toggleConnect(connectModal.id)}
        />
      )}
    </div>
  );
}

function ServiceCard({ service, onConnect, onDisconnect }: {
  service: Service;
  onConnect?: () => void;
  onDisconnect?: () => void;
}) {
  const isConnected = service.status === "connected";
  return (
    <div
      className="flex items-start gap-3.5 p-4 rounded-2xl"
      style={{
        background: isConnected ? "rgba(232,220,200,0.55)" : "rgba(232,220,200,0.3)",
        border: isConnected ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(216,195,165,0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
        style={{ background: isConnected ? "rgba(107,68,35,0.1)" : "#EDE4D6" }}
      >
        {service.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{service.name}</span>
          {isConnected && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(122,140,92,0.15)", color: "#7A8C5C", fontFamily: "var(--font-ui)" }}>
              ✓ Connecté
            </span>
          )}
        </div>
        <p className="text-xs mb-2 leading-snug" style={{ color: "#8B6A4A", fontFamily: "var(--font-ui)" }}>{service.desc}</p>
        {isConnected && service.connectedAs && (
          <p className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>@{service.connectedAs}</p>
        )}
      </div>
      <div className="shrink-0">
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: "#D8C3A5", color: "#C4622D", fontFamily: "var(--font-ui)" }}
          >
            Déconnecter
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="btn-primary text-xs px-3 py-1.5"
            style={{ borderRadius: 8, padding: "6px 12px", fontSize: 12 }}
          >
            Se connecter
          </button>
        )}
      </div>
    </div>
  );
}

function ConnectModal({ service, onClose, onConnect }: { service: Service; onClose: () => void; onConnect: () => void }) {
  const [key, setKey] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(42,29,20,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full p-6 rounded-2xl"
        style={{ maxWidth: 420, background: "#F5EFE6", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 24px 64px rgba(42,29,20,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <span style={{ fontSize: 28 }}>{service.icon}</span>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#3B2A1E" }}>Connecter {service.name}</h2>
            <p style={{ color: "#A97040", fontSize: 12, fontFamily: "var(--font-ui)" }}>
              {service.auth === "oauth" ? "Authentification OAuth" : service.auth === "key" ? "Clé API" : "Accès public"}
            </p>
          </div>
        </div>

        {service.auth === "oauth" && (
          <button className="btn-primary w-full flex items-center justify-center gap-2 mb-3" onClick={onConnect}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 3C14.76 3 17.26 4.12 19.07 5.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Continuer avec {service.name}
          </button>
        )}

        {service.auth === "key" && (
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>Clé API</label>
            <input
              className="input-field mb-3"
              type="password"
              placeholder="Collez votre clé API ici"
              value={key}
              onChange={e => setKey(e.target.value)}
            />
            <button className="btn-primary w-full" onClick={onConnect}>Valider</button>
          </div>
        )}

        <button className="w-full text-center text-sm mt-2" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }} onClick={onClose}>
          Annuler
        </button>
      </div>
    </div>
  );
}
