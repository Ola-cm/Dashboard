// Widget metadata only — feeds services/definitions/notes.js, which registers it with the
// widget registry so it shows up in GET /about.json. Fetch logic lives in provider.js.
// No external account needed: the note's content *is* the config, there's nothing to fetch.
module.exports = [
  {
    name: 'sticky_note',
    description: 'A short free-form note',
    params: [
      { name: 'title', type: 'string' },
      { name: 'content', type: 'string' },
    ],
  },
  {
    name: 'checklist',
    description: 'A simple checklist, one item per line',
    params: [
      { name: 'title', type: 'string' },
      { name: 'items', type: 'string' },
    ],
  },
];
