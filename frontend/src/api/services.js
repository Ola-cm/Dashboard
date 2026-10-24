import client from './client';

export function getServices() {
  return client.get('/services').then((res) => res.data.services);
}

export function subscribeToService(name) {
  return client.post(`/services/${name}/subscribe`).then((res) => res.data);
}

export function unsubscribeFromService(name) {
  return client.delete(`/services/${name}/subscribe`).then((res) => res.data);
}

export function getOauthUrl(serviceName) {
  return client.get(`/services/${serviceName}/oauth/start`).then((res) => res.data.url);
}
