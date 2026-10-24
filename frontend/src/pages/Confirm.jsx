import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as authApi from '../api/auth';

export default function Confirm() {
  const { token } = useParams();
  const [status, setStatus] = useState('pending'); // pending | success | error
  const [error, setError] = useState(null);
  const requestedRef = useRef(null);

  useEffect(() => {
    // Confirmation isn't idempotent (the token is consumed on first use), so React 18 Strict
    // Mode's double-invocation of effects in development would otherwise turn a successful
    // confirmation into a 404 on the second call. Guard so only one request is ever sent per
    // token, no matter how many times this effect re-runs.
    if (requestedRef.current === token) return;
    requestedRef.current = token;

    authApi
      .confirm(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setError(err.response?.data?.error || 'This confirmation link is invalid or expired.');
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-sm rounded-2xl p-8 text-center shadow-[0_4px_32px_rgba(107,68,35,0.1)]">
        {status === 'pending' && <p className="text-brown-500">Confirming your account...</p>}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-olive-pale text-2xl">
              ✓
            </div>
            <h1 className="mb-2 font-display text-2xl font-semibold text-brown-800">
              Account confirmed
            </h1>
            <p className="text-sm text-brown-500">You can now log in.</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-brown-600 px-4 py-2 text-sm font-medium text-cream shadow shadow-brown-900/20 hover:bg-brown-500"
            >
              Go to login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-pale text-2xl">
              ✕
            </div>
            <h1 className="mb-2 font-display text-2xl font-semibold text-brown-800">
              Confirmation failed
            </h1>
            <p role="alert" className="text-sm text-brown-500">
              {error}
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block text-sm font-medium text-brown-600 hover:text-brown-500"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
