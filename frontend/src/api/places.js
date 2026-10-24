import client from './client';

export function autocompletePlaces(query) {
  return client.get('/places/autocomplete', { params: { query } }).then((res) => res.data.suggestions);
}
