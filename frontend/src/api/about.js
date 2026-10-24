import axios from 'axios';

// /about.json is a root-level endpoint per the project spec, not under /api like the rest.
export function getAbout() {
  return axios.get('/about.json').then((res) => res.data);
}
