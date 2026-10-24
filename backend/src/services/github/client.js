// Plain axios calls against the GitHub REST API — @octokit/rest is ESM-only from v20 on and
// doesn't load under this project's CommonJS Jest setup, so we skip the SDK entirely.
const axios = require('axios');
const { withRetry } = require('../httpClient');

const GITHUB_API_URL = 'https://api.github.com';

function splitRepo(repo) {
  const [owner, name] = repo.split('/');
  return { owner, name };
}

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
  };
}

async function getRecentCommits(accessToken, repo, count) {
  const { owner, name } = splitRepo(repo);
  const { data } = await withRetry(() =>
    axios.get(`${GITHUB_API_URL}/repos/${owner}/${name}/commits`, {
      headers: authHeaders(accessToken),
      params: { per_page: count },
    }),
  );
  return data.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author?.name,
    date: commit.commit.author?.date,
  }));
}

async function getSecurityAlerts(accessToken, repo) {
  const { owner, name } = splitRepo(repo);
  const { data } = await withRetry(() =>
    axios.get(`${GITHUB_API_URL}/repos/${owner}/${name}/dependabot/alerts`, {
      headers: authHeaders(accessToken),
    }),
  );
  return data.map((alert) => ({
    number: alert.number,
    severity: alert.security_advisory?.severity,
    summary: alert.security_advisory?.summary,
    state: alert.state,
  }));
}

async function getRepoActivity(accessToken, repo, days) {
  const { owner, name } = splitRepo(repo);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await withRetry(() =>
    axios.get(`${GITHUB_API_URL}/repos/${owner}/${name}/commits`, {
      headers: authHeaders(accessToken),
      params: { since, per_page: 100 },
    }),
  );
  return { repo, days, commitCount: data.length };
}

// Works for both user and organization handles — GitHub serves public repos for either
// through the same /users/:handle/repos endpoint.
async function getUserRepositories(accessToken, handle) {
  const { data } = await withRetry(() =>
    axios.get(`${GITHUB_API_URL}/users/${handle}/repos`, {
      headers: authHeaders(accessToken),
      params: { per_page: 10, sort: 'updated' },
    }),
  );
  return data.map((repo) => ({
    name: repo.full_name,
    description: repo.description,
    stars: repo.stargazers_count,
    url: repo.html_url,
  }));
}

// GitHub's issues endpoint also returns pull requests, so those are filtered out here to keep
// only genuine issues.
async function getRepoIssues(accessToken, repo) {
  const { owner, name } = splitRepo(repo);
  const { data } = await withRetry(() =>
    axios.get(`${GITHUB_API_URL}/repos/${owner}/${name}/issues`, {
      headers: authHeaders(accessToken),
      params: { per_page: 10, state: 'open' },
    }),
  );
  return data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      author: issue.user?.login,
      createdAt: issue.created_at,
    }));
}

module.exports = {
  getRecentCommits,
  getSecurityAlerts,
  getRepoActivity,
  getUserRepositories,
  getRepoIssues,
};
