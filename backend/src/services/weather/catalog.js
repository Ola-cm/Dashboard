// Widget metadata only — feeds services/definitions/weather.js, which registers it with the
// widget registry so it shows up in GET /about.json. Fetch logic lives in provider.js.
module.exports = [
  {
    name: 'city_temperature',
    description: 'Current temperature for a city',
    params: [{ name: 'city', type: 'string' }],
  },
  {
    name: 'sky_overview',
    description: 'Current sky conditions (clear, clouds, rain, ...) for a city',
    params: [{ name: 'city', type: 'string' }],
  },
  {
    name: 'precipitation_forecast',
    description: 'Precipitation forecast for a city over the next N days',
    params: [
      { name: 'city', type: 'string' },
      { name: 'days', type: 'integer' },
    ],
  },
];
