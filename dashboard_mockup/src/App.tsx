import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ServicesPage from "./pages/ServicesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

export type Screen = "login" | "register" | "dashboard" | "services" | "profile" | "admin";

export interface User {
  name: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
}

const DEMO_USER: User = {
  name: "Camille Durand",
  email: "camille@example.com",
  avatar: "CD",
  role: "user",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = () => {
    setUser(DEMO_USER);
    setScreen("dashboard");
  };
  const handleLogout = () => {
    setUser(null);
    setScreen("login");
  };

  if (screen === "login") return <LoginPage onLogin={handleLogin} onRegister={() => setScreen("register")} />;
  if (screen === "register") return <RegisterPage onBack={() => setScreen("login")} onRegister={handleLogin} />;
  if (!user) return <LoginPage onLogin={handleLogin} onRegister={() => setScreen("register")} />;

  return (
    <div className="flex flex-col" style={{ minHeight: "100%", background: "#F5EFE6" }}>
      <TopBar user={user} screen={screen} onNavigate={setScreen} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        {screen === "dashboard" && <DashboardPage onNavigate={setScreen} />}
        {screen === "services" && <ServicesPage />}
        {screen === "profile" && <ProfilePage user={user} onLogout={handleLogout} />}
        {screen === "admin" && <AdminPage />}
      </main>
    </div>
  );
}

function TopBar({ user, screen, onNavigate, onLogout }: {
  user: User;
  screen: Screen;
  onNavigate: (s: Screen) => void;
  onLogout: () => void;
}) {
  const navItems: { label: string; key: Screen }[] = [
    { label: "Dashboard", key: "dashboard" },
    { label: "Services", key: "services" },
    { label: "Profil", key: "profile" },
    ...(user.role === "admin" ? [{ label: "Admin", key: "admin" as Screen }] : []),
  ];

  return (
    <header className="topbar sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between" style={{ height: 56 }}>
      <div className="flex items-center gap-6">
        <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#6B4423" }}>
            <span style={{ color: "#F5EFE6", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>W</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#3B2A1E", fontSize: 17 }}>Widgetly</span>
        </button>
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                fontFamily: "var(--font-ui)",
                color: screen === item.key ? "#6B4423" : "#8B6A4A",
                background: screen === item.key ? "rgba(107,68,35,0.1)" : "transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("profile")}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-opacity hover:opacity-80"
          style={{ background: "#6B4423", color: "#F5EFE6", fontFamily: "var(--font-ui)" }}
          title={user.name}
        >
          {user.avatar}
        </button>
        <button
          onClick={onLogout}
          className="hidden sm:block text-xs px-3 py-1.5 rounded-lg border transition-colors"
          style={{ borderColor: "#D8C3A5", color: "#8B5A2B", fontFamily: "var(--font-ui)" }}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
