import client from './client';

export function listWidgets() {
  return client.get('/dashboard/widgets').then((res) => res.data.widgets);
}

export function createWidget(payload) {
  return client.post('/dashboard/widgets', payload).then((res) => res.data.widget);
}

export function updateWidget(id, payload) {
  return client.patch(`/dashboard/widgets/${id}`, payload).then((res) => res.data.widget);
}

export function deleteWidget(id) {
  return client.delete(`/dashboard/widgets/${id}`);
}

export function getWidgetData(id) {
  return client.get(`/dashboard/widgets/${id}/data`).then((res) => res.data);
}
