import client from './client';

export function register({ email, password, name }) {
  return client.post('/auth/register', { email, password, name }).then((res) => res.data);
}

export function login({ email, password }) {
  return client.post('/auth/login', { email, password }).then((res) => res.data);
}

export function getMe() {
  return client.get('/auth/me').then((res) => res.data);
}

export function updateAccount(changes) {
  return client.patch('/auth/me', changes).then((res) => res.data);
}

export function deleteAccount(password) {
  return client.delete('/auth/me', { data: { password } });
}

export function confirm(token) {
  return client.get(`/auth/confirm/${token}`).then((res) => res.data);
}
