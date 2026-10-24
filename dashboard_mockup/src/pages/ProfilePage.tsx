import type { User } from "../App";

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ProfilePage({ user, onLogout }: Props) {
  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#3B2A1E", marginBottom: 24 }}>Mon profil</h1>

      {/* Profile card */}
      <div
        className="p-6 rounded-2xl mb-5"
        style={{ background: "rgba(232,220,200,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.6)" }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
            style={{ background: "#6B4423", color: "#F5EFE6", fontFamily: "var(--font-display)" }}
          >
            {user.avatar}
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#3B2A1E" }}>{user.name}</h2>
            <p style={{ color: "#A97040", fontSize: 13, fontFamily: "var(--font-ui)" }}>{user.email}</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: "rgba(122,140,92,0.15)", color: "#7A8C5C", fontFamily: "var(--font-ui)" }}
            >
              {user.role === "admin" ? "Administrateur" : "Utilisateur"}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>Nom complet</label>
            <input className="input-field" defaultValue={user.name} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>E-mail</label>
            <input className="input-field" type="email" defaultValue={user.email} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn-primary text-sm">Enregistrer les modifications</button>
        </div>
      </div>

      {/* Password section */}
      <div
        className="p-6 rounded-2xl mb-5"
        style={{ background: "rgba(232,220,200,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.6)" }}
      >
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#3B2A1E", marginBottom: 16 }}>Sécurité</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>Mot de passe actuel</label>
            <input className="input-field" type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>Nouveau mot de passe</label>
            <input className="input-field" type="password" placeholder="8 caractères minimum" />
          </div>
        </div>
        <button className="btn-ghost text-sm mt-4">Changer le mot de passe</button>
      </div>

      {/* Linked services */}
      <div
        className="p-6 rounded-2xl mb-5"
        style={{ background: "rgba(232,220,200,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.6)" }}
      >
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#3B2A1E", marginBottom: 16 }}>Services liés</h3>
        <div className="space-y-3">
          {[
            { icon: "🐙", name: "GitHub", linked: true, as: "camilledurand" },
            { icon: "🎮", name: "Steam", linked: false },
            { icon: "🎵", name: "Spotify", linked: false },
          ].map(svc => (
            <div key={svc.name} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(107,68,35,0.08)" }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 20 }}>{svc.icon}</span>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{svc.name}</div>
                  {svc.linked && <div className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>@{svc.as}</div>}
                </div>
              </div>
              <button
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{ borderColor: "#D8C3A5", color: svc.linked ? "#C4622D" : "#8B5A2B", fontFamily: "var(--font-ui)" }}
              >
                {svc.linked ? "Délier" : "Connecter"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div
        className="p-6 rounded-2xl"
        style={{ background: "rgba(196,98,45,0.05)", border: "1px solid rgba(196,98,45,0.2)" }}
      >
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#C4622D", marginBottom: 12 }}>Zone dangereuse</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onLogout}
            className="text-sm px-4 py-2 rounded-xl border transition-colors"
            style={{ borderColor: "#D8C3A5", color: "#8B5A2B", fontFamily: "var(--font-ui)" }}
          >
            Se déconnecter
          </button>
          <button
            className="text-sm px-4 py-2 rounded-xl transition-colors"
            style={{ background: "rgba(196,98,45,0.1)", color: "#C4622D", fontFamily: "var(--font-ui)" }}
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
