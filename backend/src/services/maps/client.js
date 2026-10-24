// Open-Meteo geocoding (free, no key) + OSRM (routing, free, no key).
// Nominatim was tried first for geocoding but its usage policy actively blocks automated/cloud
// traffic ("Access denied" — https://operations.osmfoundation.org/policies/nominatim/), which
// broke every widget in this service outright when tested from a cloud sandbox. Open-Meteo's
// geocoding API is built for exactly this kind of programmatic use and isn't blocked.
const axios = require('axios');
const { withRetry } = require('../httpClient');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OSRM_URL = 'https://router.project-osrm.org';

async function geocode(query) {
  const { data } = await withRetry(() =>
    axios.get(GEOCODING_URL, { params: { name: query, count: 1 } }),
  );
  const place = data.results?.[0];
  if (!place) {
    const err = new Error(`Could not find a location for "${query}"`);
    err.status = 404;
    throw err;
  }
  return {
    lat: place.latitude,
    lon: place.longitude,
    displayName: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
  };
}

async function getRoute(origin, destination, profile) {
  const [from, to] = await Promise.all([geocode(origin), geocode(destination)]);
  const { data } = await withRetry(() =>
    axios.get(`${OSRM_URL}/route/v1/${profile}/${from.lon},${from.lat};${to.lon},${to.lat}`, {
      params: { overview: 'false' },
    }),
  );
  const route = data.routes?.[0];
  if (!route) {
    const err = new Error(`No ${profile} route found between "${origin}" and "${destination}"`);
    err.status = 404;
    throw err;
  }
  return {
    origin: from.displayName,
    destination: to.displayName,
    distanceKm: Math.round(route.distance / 100) / 10,
    durationMin: Math.round(route.duration / 60),
  };
}

module.exports = {
  getPlace: (query) => geocode(query),
  getDirections: (origin, destination) => getRoute(origin, destination, 'driving'),
  getCyclingRoute: (origin, destination) => getRoute(origin, destination, 'cycling'),
};
