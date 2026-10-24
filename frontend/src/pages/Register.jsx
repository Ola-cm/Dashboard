import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong, please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass w-full max-w-sm rounded-2xl p-8 text-center shadow-[0_4px_32px_rgba(107,68,35,0.1)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-olive-pale text-2xl">
            ✓
          </div>
          <h1 className="mb-2 font-display text-2xl font-semibold text-brown-800">
            Check your inbox
          </h1>
          <p className="text-sm text-brown-500">
            We sent a confirmation link to{' '}
            <span className="font-medium text-brown-700">{form.email}</span>. Confirm your account
            before logging in.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-medium text-brown-600 hover:text-brown-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brown-600 shadow-lg shadow-brown-900/20">
            <span className="font-display text-xl font-bold text-cream">D</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-brown-800">Create an account</h1>
          <p className="mt-1 text-sm text-brown-300">Build your own dashboard</p>
        </div>

        <div className="glass rounded-2xl p-7 shadow-[0_4px_32px_rgba(107,68,35,0.1)]">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-brown-600">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                className="w-full rounded-lg border border-brown-200 bg-white/60 px-3 py-2.5 text-brown-800 placeholder-brown-300 outline-none focus:border-brown-500 focus:ring-1 focus:ring-brown-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-brown-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
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
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
                className="w-full rounded-lg border border-brown-200 bg-white/60 px-3 py-2.5 text-brown-800 placeholder-brown-300 outline-none focus:border-brown-500 focus:ring-1 focus:ring-brown-500"
              />
              <p className="mt-1.5 text-xs text-brown-300">At least 8 characters.</p>
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
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
            <p className="text-center text-xs text-brown-400">
              Your name and email are used only to run your dashboard. See the{' '}
              <Link to="/legal" className="font-medium text-brown-600 hover:underline">
                privacy policy
              </Link>
              .
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-brown-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brown-600 hover:text-brown-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
