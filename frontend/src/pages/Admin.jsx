import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as adminApi from '../api/admin';
import AppShell from '../components/AppShell';
import { useConfirm } from '../hooks/useConfirm';

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { confirm, confirmDialog } = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi
      .listUsers()
      .then(setUsers)
      .catch(() => setError('Could not load users.'))
      .finally(() => setLoading(false));
  }, []);

  async function toggleRole(targetUser) {
    const nextRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const updated = await adminApi.updateUserRole(targetUser.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update this user.');
    }
  }

  async function removeUser(targetUser) {
    const confirmed = await confirm({
      title: 'Delete this account?',
      message: `The account "${targetUser.email}" will be deleted. This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminApi.deleteUser(targetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete this user.');
    }
  }

  return (
    <AppShell
      title="Users"
      actions={
        <span className="rounded-full bg-brown-600/10 px-2.5 py-0.5 text-xs font-medium text-brown-500">
          {users.length} total
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {loading && <p className="text-brown-400">Loading users...</p>}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-terracotta/30 bg-terracotta-pale/60 px-3 py-2 text-sm text-terracotta"
          >
            {error}
          </p>
        )}
        <div className="glass overflow-hidden overflow-x-auto rounded-xl shadow-xl shadow-brown-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-brown-600/5 text-xs uppercase tracking-wide text-brown-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Confirmed</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-2/60 text-brown-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-brown-600/5">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-brown-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-brown-600/15 text-brown-700'
                          : 'bg-brown-600/5 text-brown-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isConfirmed ? (
                      <span className="text-olive">Yes</span>
                    ) : (
                      <span className="text-brown-300">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brown-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.id === currentUser.id ? (
                      <span className="text-xs text-brown-300">You</span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRole(u)}
                          className="rounded-md border border-brown-200 px-2.5 py-1 text-xs font-medium text-brown-600 hover:bg-brown-600/10"
                        >
                          {u.role === 'ADMIN' ? 'Revoke admin' : 'Make admin'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeUser(u)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-terracotta hover:bg-terracotta-pale/60"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {confirmDialog}
    </AppShell>
  );
}
