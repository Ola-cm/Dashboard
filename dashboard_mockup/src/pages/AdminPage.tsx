import { useState } from "react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "disabled";
  widgets: number;
  joined: string;
}

const USERS: AdminUser[] = [
  { id: "1", name: "Camille Durand", email: "camille@example.com", role: "admin", status: "active", widgets: 7, joined: "15 jan. 2024" },
  { id: "2", name: "Thomas Leblanc", email: "thomas@example.com", role: "user", status: "active", widgets: 12, joined: "3 fév. 2024" },
  { id: "3", name: "Priya Nair", email: "priya@example.com", role: "user", status: "active", widgets: 4, joined: "22 fév. 2024" },
  { id: "4", name: "Julien Martin", email: "julien@example.com", role: "user", status: "disabled", widgets: 2, joined: "8 mars 2024" },
  { id: "5", name: "Sofia Almeida", email: "sofia@example.com", role: "user", status: "active", widgets: 9, joined: "14 mars 2024" },
  { id: "6", name: "Noah Berger", email: "noah@example.com", role: "user", status: "active", widgets: 3, joined: "29 mars 2024" },
];

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(USERS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUsers(u => u.map(usr => usr.id === id ? { ...usr, status: usr.status === "active" ? "disabled" : "active" } : usr));
    setSelected(null);
  };

  const stats = [
    { label: "Utilisateurs actifs", value: users.filter(u => u.status === "active").length },
    { label: "Comptes désactivés", value: users.filter(u => u.status === "disabled").length },
    { label: "Total widgets créés", value: users.reduce((s, u) => s + u.widgets, 0) },
    { label: "Nouveaux ce mois", value: 4 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="mb-6">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#3B2A1E", marginBottom: 4 }}>Administration</h1>
        <p style={{ color: "#8B6A4A", fontSize: 14, fontFamily: "var(--font-ui)" }}>Gestion des comptes utilisateurs.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl"
            style={{ background: "rgba(232,220,200,0.55)", border: "1px solid rgba(255,255,255,0.6)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#3B2A1E", lineHeight: 1 }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="input-field"
          style={{ maxWidth: 360 }}
          placeholder="Rechercher un utilisateur…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* User table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(232,220,200,0.45)", border: "1px solid rgba(255,255,255,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
      >
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(107,68,35,0.1)" }}>
              {["Utilisateur", "Rôle", "Statut", "Widgets", "Inscription", "Actions"].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "#8B5A2B", fontFamily: "var(--font-ui)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid rgba(107,68,35,0.06)" }} className="hover:bg-black/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: user.status === "disabled" ? "#EDE4D6" : "#6B4423", color: user.status === "disabled" ? "#C49060" : "#F5EFE6", fontFamily: "var(--font-display)" }}
                    >
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{user.name}</div>
                      <div className="text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: user.role === "admin" ? "rgba(107,68,35,0.12)" : "rgba(216,195,165,0.4)",
                      color: user.role === "admin" ? "#6B4423" : "#8B6A4A",
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    {user.role === "admin" ? "Admin" : "Utilisateur"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"
                    style={{
                      background: user.status === "active" ? "rgba(122,140,92,0.15)" : "rgba(196,98,45,0.1)",
                      color: user.status === "active" ? "#7A8C5C" : "#C4622D",
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: user.status === "active" ? "#7A8C5C" : "#C4622D" }} />
                    {user.status === "active" ? "Actif" : "Désactivé"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)" }}>{user.widgets}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{user.joined}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: "#D8C3A5", color: "#8B5A2B", fontFamily: "var(--font-ui)" }}
                      onClick={() => setSelected(user)}
                    >
                      Voir
                    </button>
                    <button
                      className="text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                      style={{
                        background: user.status === "active" ? "rgba(196,98,45,0.08)" : "rgba(122,140,92,0.1)",
                        color: user.status === "active" ? "#C4622D" : "#7A8C5C",
                        fontFamily: "var(--font-ui)",
                      }}
                      onClick={() => toggleStatus(user.id)}
                    >
                      {user.status === "active" ? "Désactiver" : "Réactiver"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>
            Aucun utilisateur trouvé pour «{search}»
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(42,29,20,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full p-6 rounded-2xl"
            style={{ maxWidth: 400, background: "#F5EFE6", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 24px 64px rgba(42,29,20,0.2)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold" style={{ background: "#6B4423", color: "#F5EFE6", fontFamily: "var(--font-display)" }}>
                {selected.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#3B2A1E" }}>{selected.name}</h2>
                <p style={{ color: "#A97040", fontSize: 12, fontFamily: "var(--font-ui)" }}>{selected.email}</p>
              </div>
            </div>
            <div className="space-y-2 mb-5 p-3 rounded-xl" style={{ background: "rgba(107,68,35,0.05)" }}>
              {[
                ["Rôle", selected.role === "admin" ? "Administrateur" : "Utilisateur"],
                ["Statut", selected.status === "active" ? "Actif" : "Désactivé"],
                ["Widgets", String(selected.widgets)],
                ["Inscrit le", selected.joined],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color: "#A97040", fontFamily: "var(--font-ui)" }}>{k}</span>
                  <span style={{ color: "#3B2A1E", fontFamily: "var(--font-ui)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: selected.status === "active" ? "rgba(196,98,45,0.1)" : "rgba(122,140,92,0.1)", color: selected.status === "active" ? "#C4622D" : "#7A8C5C", fontFamily: "var(--font-ui)" }}
                onClick={() => toggleStatus(selected.id)}
              >
                {selected.status === "active" ? "Désactiver le compte" : "Réactiver le compte"}
              </button>
              <button className="btn-ghost text-sm py-2 px-4" onClick={() => setSelected(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
