// Reuses the same free, key-less Open-Meteo geocoding API the maps service resolves cities
// through (see services/maps/client.js) — but asks for several matches instead of one, to back
// an autocomplete field instead of resolving a single already-typed name.
const axios = require('axios');
const { withRetry } = require('../httpClient');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const MAX_RESULTS = 5;

async function searchPlaces(query) {
  const { data } = await withRetry(() =>
    axios.get(GEOCODING_URL, { params: { name: query, count: MAX_RESULTS } }),
  );
  return (data.results || []).map((place) => ({
    label: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
    lat: place.latitude,
    lon: place.longitude,
  }));
}

module.exports = { searchPlaces };
