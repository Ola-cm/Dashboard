import { useState } from "react";

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

export default function LoginPage({ onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<"login" | "confirm">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (mode === "confirm") {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(122,140,92,0.15)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="#7A8C5C" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M22 6l-10 7L2 6" stroke="#7A8C5C" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#3B2A1E", marginBottom: 8 }}>Vérifiez vos e-mails</h2>
          <p style={{ color: "#8B6A4A", fontSize: 14, lineHeight: 1.6, marginBottom: 24, fontFamily: "var(--font-ui)" }}>
            Un lien de confirmation a été envoyé à <strong>{email || "votre adresse e-mail"}</strong>. Cliquez dessus pour activer votre compte.
          </p>
          <button className="btn-primary w-full" onClick={onLogin}>J&apos;ai confirmé mon e-mail</button>
          <button
            className="mt-3 text-sm"
            style={{ color: "#8B5A2B", fontFamily: "var(--font-ui)" }}
            onClick={() => setMode("login")}
          >
            Retour à la connexion
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "#3B2A1E", marginBottom: 4 }}>Bonjour !</h2>
      <p style={{ color: "#8B6A4A", fontSize: 13, marginBottom: 28, fontFamily: "var(--font-ui)" }}>
        Connectez-vous pour accéder à votre dashboard.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>E-mail</label>
        <input
          className="input-field"
          type="email"
          placeholder="camille@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>Mot de passe</label>
        <input
          className="input-field"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="text-xs mt-2 block" style={{ color: "#8B5A2B", fontFamily: "var(--font-ui)" }}>
          Mot de passe oublié ?
        </button>
      </div>

      <button className="btn-primary w-full mb-3" onClick={onLogin}>Se connecter</button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: "#D8C3A5" }} />
        <span className="text-xs" style={{ color: "#C49060", fontFamily: "var(--font-ui)" }}>ou</span>
        <div className="flex-1 h-px" style={{ background: "#D8C3A5" }} />
      </div>

      <button
        className="btn-ghost w-full flex items-center justify-center gap-2.5 mb-4"
        onClick={onLogin}
      >
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14 }}>Continuer avec Google</span>
      </button>

      <p className="text-center text-sm" style={{ color: "#8B6A4A", fontFamily: "var(--font-ui)" }}>
        Pas encore de compte ?{" "}
        <button className="font-medium" style={{ color: "#6B4423" }} onClick={onRegister}>Créer un compte</button>
      </p>
      <p className="text-center text-sm mt-2" style={{ color: "#8B6A4A", fontFamily: "var(--font-ui)" }}>
        En attente de confirmation ?{" "}
        <button className="font-medium" style={{ color: "#6B4423" }} onClick={() => setMode("confirm")}>Vérifier</button>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-full flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 20% 50%, rgba(196,98,45,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(107,68,35,0.06) 0%, transparent 50%), #F5EFE6",
        minHeight: "100vh",
      }}
    >
      <div className="w-full" style={{ maxWidth: 420 }}>
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "#6B4423" }}
          >
            <span style={{ color: "#F5EFE6", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>W</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#3B2A1E", fontWeight: 600 }}>Widgetly</h1>
          <p style={{ color: "#C49060", fontSize: 12, fontFamily: "var(--font-ui)" }}>Votre dashboard, à votre image</p>
        </div>
        <div
          className="p-7 rounded-2xl"
          style={{
            background: "rgba(232, 220, 200, 0.55)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 4px 32px rgba(107,68,35,0.1)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
