import client from './client';

export function getShareStatus() {
  return client.get('/dashboard/share').then((res) => res.data);
}

export function enableSharing() {
  return client.post('/dashboard/share').then((res) => res.data);
}

export function disableSharing() {
  return client.delete('/dashboard/share');
}

export function getSharedDashboard(token) {
  return client.get(`/public/dashboards/${token}`).then((res) => res.data);
}
