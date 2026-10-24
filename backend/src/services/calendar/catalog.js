// Widget metadata only — feeds services/definitions/calendar.js, which registers it with the
// widget registry so it shows up in GET /about.json. Fetch logic lives in provider.js.
// No external account needed: both widgets are computed from the params alone.
module.exports = [
  {
    name: 'month_view',
    description: 'A calendar grid for a given month and year',
    params: [
      { name: 'month', type: 'integer' },
      { name: 'year', type: 'integer' },
    ],
  },
  {
    name: 'countdown',
    description: 'Days remaining until a target date',
    params: [
      { name: 'label', type: 'string' },
      { name: 'target_date', type: 'string' },
    ],
  },
  {
    name: 'days_since',
    description: "Days elapsed since a start date — countdown's mirror image",
    params: [
      { name: 'label', type: 'string' },
      { name: 'start_date', type: 'string' },
    ],
  },
];
