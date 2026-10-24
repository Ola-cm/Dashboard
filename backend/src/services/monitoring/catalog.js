// Widget metadata only — feeds services/definitions/monitoring.js, which registers it with the
// widget registry so it shows up in GET /about.json. Fetch logic lives in provider.js.
// No external account needed: this service pings whatever URL the user configures, itself.
module.exports = [
  {
    name: 'uptime_check',
    description: 'Current up/down status and response time for a URL',
    params: [{ name: 'url', type: 'string' }],
  },
  {
    name: 'response_time',
    description: 'Average, min and max response time over several requests to a URL',
    params: [
      { name: 'url', type: 'string' },
      { name: 'samples', type: 'integer' },
    ],
  },
  {
    name: 'error_rate',
    description: 'Error rate (4xx/5xx) for an endpoint over a given time period',
    params: [
      { name: 'endpoint_url', type: 'string' },
      { name: 'time_range', type: 'string' },
    ],
  },
  {
    name: 'latency_tracker',
    description: "An endpoint's response time over several requests, as a curve and last value",
    params: [
      { name: 'endpoint_url', type: 'string' },
      { name: 'sample_count', type: 'integer' },
    ],
  },
];
