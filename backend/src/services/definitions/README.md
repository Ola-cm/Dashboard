# Service definitions

Each file here registers one service (weather, github, rss, ...) with the widget registry, so
it shows up in `GET /about.json` automatically. Nothing else needs to be edited.

```js
// backend/src/services/definitions/weather.js
const { registerService } = require('../widgetRegistry');

registerService('weather', [
  {
    name: 'city_temperature',
    description: 'Display temperature for a city',
    params: [{ name: 'city', type: 'string' }],
  },
]);
```

Rules enforced by the registry (violating one throws at startup, not silently):

- a widget needs at least one param — a widget with no configurable option is invalid per the
  project spec;
- param `type` must be `"integer"` or `"string"`.
