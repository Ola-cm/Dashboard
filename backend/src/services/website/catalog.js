// Widget metadata only — feeds services/definitions/website.js, which registers it with the
// widget registry so it shows up in GET /about.json. Fetch logic lives in provider.js.
// No account needed: everything comes from the site itself and from free, keyless public sources
// (Wikipedia/Wikidata for the knowledge panel, RDAP for domain registration data).
module.exports = [
  {
    name: 'site_overview',
    description: "What a website says about itself: name, title, description, icon and preview image",
    params: [{ name: 'url', type: 'string' }],
  },
  {
    name: 'knowledge_panel',
    description: 'Search-engine style card about a site or organization: Wikipedia summary and key facts',
    params: [
      { name: 'query', type: 'string' },
      { name: 'language', type: 'string' },
    ],
  },
  {
    name: 'domain_info',
    description: "A domain's registration details: creation date, age, expiry, registrar, name servers",
    params: [{ name: 'domain', type: 'string' }],
  },
];
