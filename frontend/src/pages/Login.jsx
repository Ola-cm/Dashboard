import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong, please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brown-600 shadow-lg shadow-brown-900/20">
            <span className="font-display text-xl font-bold text-cream">D</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-brown-800">Welcome back</h1>
          <p className="mt-1 text-sm text-brown-300">Log in to your dashboard</p>
        </div>

        <div className="glass rounded-2xl p-7 shadow-[0_4px_32px_rgba(107,68,35,0.1)]">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-brown-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-brown-200 bg-white/60 px-3 py-2.5 text-brown-800 placeholder-brown-300 outline-none focus:border-brown-500 focus:ring-1 focus:ring-brown-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-brown-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-brown-200 bg-white/60 px-3 py-2.5 text-brown-800 placeholder-brown-300 outline-none focus:border-brown-500 focus:ring-1 focus:ring-brown-500"
              />
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-terracotta/30 bg-terracotta-pale/60 px-3 py-2 text-sm text-terracotta"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brown-600 py-2.5 font-medium text-cream shadow-lg shadow-brown-900/20 transition-colors hover:bg-brown-500 disabled:opacity-50"
            >
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-brown-400">
          No account yet?{' '}
          <Link to="/register" className="font-medium text-brown-600 hover:text-brown-500">
            Register
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-brown-400">
          <Link to="/legal" className="hover:text-brown-600 hover:underline">
            Legal notice &amp; privacy
          </Link>
        </p>
      </div>
    </div>
  );
}
