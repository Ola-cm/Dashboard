import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/AppShell';
import { useConfirm } from '../hooks/useConfirm';
import * as shareApi from '../api/share';
import * as authApi from '../api/auth';

function ShareDashboard() {
  const { confirm, confirmDialog } = useConfirm();
  const [shareToken, setShareToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    shareApi
      .getShareStatus()
      .then(({ shareToken: token }) => setShareToken(token))
      .finally(() => setLoading(false));
  }, []);

  const shareUrl = shareToken ? `${window.location.origin}/shared/${shareToken}` : null;

  async function handleEnable() {
    setBusy(true);
    try {
      const { shareToken: token } = await shareApi.enableSharing();
      setShareToken(token);
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    const confirmed = await confirm({
      title: 'Turn off sharing?',
      message: 'The current link will stop working.',
      confirmLabel: 'Turn off',
      danger: true,
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await shareApi.disableSharing();
      setShareToken(null);
    } finally {
      setBusy(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return null;

  return (
    <div className="glass mt-4 rounded-2xl p-6 shadow-xl shadow-brown-900/10">
      {confirmDialog}
      <p className="font-medium text-brown-800">Share my dashboard</p>
      <p className="mt-1 text-sm text-brown-400">
        Anyone with the link can view a live, read-only copy of your dashboard — no account needed.
      </p>

      {shareToken ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="w-full min-w-0 rounded-lg border border-card-2/60 bg-white/60 px-3 py-1.5 text-sm text-brown-700"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-lg bg-brown-600 px-3 py-1.5 text-sm font-medium text-cream hover:bg-brown-500"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleDisable}
            disabled={busy}
            className="text-sm font-medium text-terracotta hover:text-terracotta-light disabled:opacity-50"
          >
            Turn off sharing
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleEnable}
          disabled={busy}
          className="mt-4 rounded-lg bg-brown-600 px-3.5 py-1.5 text-sm font-medium text-cream shadow shadow-brown-900/20 hover:bg-brown-500 disabled:opacity-50"
        >
          Enable sharing
        </button>
      )}
    </div>
  );
}

const FIELD_CLASS =
  'w-full rounded-lg border border-brown-200 bg-white/60 px-3 py-2 text-brown-800 outline-none focus:border-brown-500 focus:ring-1 focus:ring-brown-500';
const LABEL_CLASS = 'mb-1 block text-sm font-medium text-brown-600';

function AccountDetails() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [busy, setBusy] = useState(false);

  const nameChanged = name.trim() !== user.name;
  const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();
  const passwordChanged = newPassword !== '';
  // The current password is only asked for when the backend actually requires it.
  const needsCurrentPassword = emailChanged || passwordChanged;
  const hasChanges = nameChanged || emailChanged || passwordChanged;

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (passwordChanged && newPassword !== confirmPassword) {
      setError("The two new passwords don't match.");
      return;
    }

    const changes = {};
    if (nameChanged) changes.name = name.trim();
    if (emailChanged) changes.email = email.trim();
    if (passwordChanged) changes.newPassword = newPassword;
    if (needsCurrentPassword) changes.currentPassword = currentPassword;

    setBusy(true);
    try {
      const result = await authApi.updateAccount(changes);
      updateUser(result.user);
      setName(result.user.name);
      setEmail(result.user.email);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setSuccess(
        result.emailChanged
          ? `Saved. We sent a confirmation link to ${result.user.email} — confirm it before your next login.`
          : 'Your details have been updated.',
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update your details, please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass mt-4 space-y-4 rounded-2xl p-6 shadow-xl shadow-brown-900/10"
      noValidate
    >
      <p className="font-medium text-brown-800">Account details</p>
      <div>
        <label htmlFor="profile-name" className={LABEL_CLASS}>
          Name
        </label>
        <input
          id="profile-name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>
      <div>
        <label htmlFor="profile-email" className={LABEL_CLASS}>
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={FIELD_CLASS}
        />
        {emailChanged && (
          <p className="mt-1 text-xs text-brown-400">
            You&apos;ll need to confirm the new address before your next login.
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-new-password" className={LABEL_CLASS}>
            New password
          </label>
          <input
            id="profile-new-password"
            type="password"
            autoComplete="new-password"
            placeholder="Keep current"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="profile-confirm-password" className={LABEL_CLASS}>
            Confirm new password
          </label>
          <input
            id="profile-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!passwordChanged}
            className={`${FIELD_CLASS} disabled:opacity-50`}
          />
        </div>
      </div>
      {needsCurrentPassword && (
        <div>
          <label htmlFor="profile-current-password" className={LABEL_CLASS}>
            Current password
          </label>
          <input
            id="profile-current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={FIELD_CLASS}
          />
          <p className="mt-1 text-xs text-brown-400">Required to change your email or password.</p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-terracotta">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-olive">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={!hasChanges || busy || (needsCurrentPassword && !currentPassword)}
        className="rounded-lg bg-brown-600 px-3.5 py-1.5 text-sm font-medium text-cream shadow shadow-brown-900/20 hover:bg-brown-500 disabled:opacity-50"
      >
        {busy ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}

function DeleteAccount() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete(event) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authApi.deleteAccount(password);
      logout();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete your account, please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="glass mt-4 rounded-2xl p-6 shadow-xl shadow-brown-900/10">
      <p className="font-medium text-terracotta">Delete my account</p>
      <p className="mt-1 text-sm text-brown-400">
        Permanently removes your account, your dashboard, its widgets and every linked service. This
        can&apos;t be undone.
      </p>

      {open ? (
        <form onSubmit={handleDelete} className="mt-4 space-y-3">
          <label htmlFor="delete-password" className="block text-sm font-medium text-brown-600">
            Confirm with your password
          </label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-brown-200 bg-white/60 px-3 py-2 text-brown-800 outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
          />
          {error && (
            <p role="alert" className="text-sm text-terracotta">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!password || busy}
              className="rounded-lg bg-terracotta px-3.5 py-1.5 text-sm font-medium text-cream hover:bg-terracotta-light disabled:opacity-50"
            >
              {busy ? 'Deleting...' : 'Delete permanently'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword('');
                setError(null);
              }}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-brown-500 hover:bg-brown-600/10"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-lg border border-terracotta/40 px-3.5 py-1.5 text-sm font-medium text-terracotta hover:bg-terracotta-pale/60"
        >
          Delete my account
        </button>
      )}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  return (
    <AppShell title="Profile">
      <div className="mx-auto max-w-md px-4 py-6 sm:px-6 sm:py-8">
        <div className="glass rounded-2xl p-6 shadow-xl shadow-brown-900/10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-600 text-lg font-semibold text-cream">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-brown-800">{user.name}</p>
              <p className="text-sm text-brown-400">{user.email}</p>
            </div>
          </div>
          <dl className="space-y-3 border-t border-card-2/60 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-brown-400">Role</dt>
              <dd className="rounded-full bg-brown-600/10 px-2.5 py-0.5 text-xs font-medium text-brown-700">
                {user.role}
              </dd>
            </div>
          </dl>
        </div>
        <AccountDetails />
        <Link
          to="/services"
          className="mt-4 inline-block text-sm font-medium text-brown-600 hover:text-brown-500"
        >
          Manage subscribed services &rarr;
        </Link>

        <ShareDashboard />
        <DeleteAccount />
      </div>
    </AppShell>
  );
}
