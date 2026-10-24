import { useState } from "react";

interface Props {
  onBack: () => void;
  onRegister: () => void;
}

export default function RegisterPage({ onBack, onRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <AuthLayout onBack={onBack}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(122,140,92,0.15)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#7A8C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#3B2A1E", marginBottom: 8 }}>Compte créé !</h2>
          <p style={{ color: "#8B6A4A", fontSize: 14, lineHeight: 1.6, marginBottom: 24, fontFamily: "var(--font-ui)" }}>
            Vérifiez votre boîte e-mail pour confirmer votre inscription à <strong>{email}</strong>.
          </p>
          <button className="btn-primary w-full" onClick={onRegister}>Accéder au dashboard</button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout onBack={onBack}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "#3B2A1E", marginBottom: 4 }}>Créer un compte</h2>
      <p style={{ color: "#8B6A4A", fontSize: 13, marginBottom: 28, fontFamily: "var(--font-ui)" }}>
        Construisez votre dashboard personnalisé en quelques secondes.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>E-mail</label>
        <input className="input-field" type="email" placeholder="vous@exemple.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>Mot de passe</label>
        <input className="input-field" type="password" placeholder="8 caractères minimum" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B4423", fontFamily: "var(--font-ui)" }}>Confirmer le mot de passe</label>
        <input className="input-field" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
        {confirm && password !== confirm && (
          <p className="text-xs mt-1.5" style={{ color: "#C4622D", fontFamily: "var(--font-ui)" }}>Les mots de passe ne correspondent pas.</p>
        )}
      </div>

      <button className="btn-primary w-full mb-3" onClick={handleSubmit}>Créer mon compte</button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: "#D8C3A5" }} />
        <span className="text-xs" style={{ color: "#C49060", fontFamily: "var(--font-ui)" }}>ou</span>
        <div className="flex-1 h-px" style={{ background: "#D8C3A5" }} />
      </div>

      <button className="btn-ghost w-full flex items-center justify-center gap-2.5 mb-4" onClick={onRegister}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14 }}>Continuer avec Google</span>
      </button>

      <p className="text-center text-sm" style={{ color: "#8B6A4A", fontFamily: "var(--font-ui)" }}>
        Déjà un compte ?{" "}
        <button className="font-medium" style={{ color: "#6B4423" }} onClick={onBack}>Se connecter</button>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div
      className="min-h-full flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 80% 50%, rgba(196,98,45,0.08) 0%, transparent 60%), #F5EFE6",
        minHeight: "100vh",
      }}
    >
      <div className="w-full" style={{ maxWidth: 420 }}>
        <div className="text-center mb-8">
          <button onClick={onBack} className="flex items-center gap-1.5 mx-auto mb-4 text-sm" style={{ color: "#8B5A2B", fontFamily: "var(--font-ui)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Retour
          </button>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "#6B4423" }}>
            <span style={{ color: "#F5EFE6", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>W</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#3B2A1E", fontWeight: 600 }}>Widgetly</h1>
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
