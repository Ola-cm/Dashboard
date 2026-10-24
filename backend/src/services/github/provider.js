const client = require('./client');

const handlers = {
  recent_commits: (config, credentials) =>
    client.getRecentCommits(credentials.accessToken, config.repo, config.count),
  security_alerts: (config, credentials) =>
    client.getSecurityAlerts(credentials.accessToken, config.repo),
  repo_activity: (config, credentials) =>
    client.getRepoActivity(credentials.accessToken, config.repo, config.days),
  user_repositories: (config, credentials) =>
    client.getUserRepositories(credentials.accessToken, config.handle),
  repo_issues: (config, credentials) => client.getRepoIssues(credentials.accessToken, config.repo),
};

async function fetchWidgetData(widgetName, config, credentials) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown github widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  if (!credentials?.accessToken) {
    const err = new Error('GitHub account not linked');
    err.status = 401;
    throw err;
  }
  const data = await handler(config, credentials);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
