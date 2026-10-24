import client from './client';

export function listUsers() {
  return client.get('/admin/users').then((res) => res.data.users);
}

export function updateUserRole(id, role) {
  return client.patch(`/admin/users/${id}`, { role }).then((res) => res.data.user);
}

export function deleteUser(id) {
  return client.delete(`/admin/users/${id}`);
}
