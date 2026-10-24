// Widget metadata only — feeds services/definitions/maps.js, which registers it with the widget
// registry so it shows up in GET /about.json. Fetch logic lives in provider.js.
// No external account needed: Open-Meteo (geocoding) and OSRM (routing) are both free, public,
// key-less services. Geocoding resolves cities/towns, not arbitrary points of interest.
module.exports = [
  {
    name: 'directions',
    description: 'Driving distance and duration between two cities',
    params: [
      { name: 'origin', type: 'string' },
      { name: 'destination', type: 'string' },
    ],
  },
  {
    name: 'cycling_route',
    description: 'Cycling distance and duration between two cities',
    params: [
      { name: 'origin', type: 'string' },
      { name: 'destination', type: 'string' },
    ],
  },
  {
    name: 'place_lookup',
    description: 'Geocode a city or town name to coordinates and a display name',
    params: [{ name: 'query', type: 'string' }],
  },
];
