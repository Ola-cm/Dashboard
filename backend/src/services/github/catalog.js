// Widget metadata only — feeds services/definitions/github.js, which registers it with the
// widget registry so it shows up in GET /about.json. Fetch logic lives in provider.js.
module.exports = [
  {
    name: 'recent_commits',
    description: 'Latest commits on a GitHub repository',
    params: [
      { name: 'repo', type: 'string' },
      { name: 'count', type: 'integer' },
    ],
  },
  {
    name: 'security_alerts',
    description: 'Open Dependabot security alerts for a GitHub repository',
    params: [{ name: 'repo', type: 'string' }],
  },
  {
    name: 'repo_activity',
    description: 'Commit activity on a GitHub repository over the last N days',
    params: [
      { name: 'repo', type: 'string' },
      { name: 'days', type: 'integer' },
    ],
  },
  {
    name: 'user_repositories',
    description: "A GitHub user or organization's repositories",
    params: [{ name: 'handle', type: 'string' }],
  },
  {
    name: 'repo_issues',
    description: 'Open issues on a GitHub repository',
    params: [{ name: 'repo', type: 'string' }],
  },
];
