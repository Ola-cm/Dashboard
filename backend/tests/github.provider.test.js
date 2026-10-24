jest.mock('../src/services/github/client');

const client = require('../src/services/github/client');
const provider = require('../src/services/github/provider');

describe('github provider', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches recent commits using the linked access token', async () => {
    client.getRecentCommits.mockResolvedValue([{ sha: 'abc', message: 'fix bug' }]);

    const result = await provider.fetchWidgetData(
      'recent_commits',
      { repo: 'octocat/hello-world', count: 5 },
      { accessToken: 'token-123' },
    );

    expect(client.getRecentCommits).toHaveBeenCalledWith('token-123', 'octocat/hello-world', 5);
    expect(result.data).toEqual([{ sha: 'abc', message: 'fix bug' }]);
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it("fetches a user or org's repositories using the linked access token", async () => {
    client.getUserRepositories.mockResolvedValue([{ name: 'octocat/hello-world', stars: 42 }]);

    const result = await provider.fetchWidgetData(
      'user_repositories',
      { handle: 'octocat' },
      { accessToken: 'token-123' },
    );

    expect(client.getUserRepositories).toHaveBeenCalledWith('token-123', 'octocat');
    expect(result.data).toEqual([{ name: 'octocat/hello-world', stars: 42 }]);
  });

  it('fetches open issues for a repo using the linked access token', async () => {
    client.getRepoIssues.mockResolvedValue([{ number: 1, title: 'Bug' }]);

    const result = await provider.fetchWidgetData(
      'repo_issues',
      { repo: 'octocat/hello-world' },
      { accessToken: 'token-123' },
    );

    expect(client.getRepoIssues).toHaveBeenCalledWith('token-123', 'octocat/hello-world');
    expect(result.data).toEqual([{ number: 1, title: 'Bug' }]);
  });

  it('rejects when the user has not linked a GitHub account', async () => {
    await expect(
      provider.fetchWidgetData('recent_commits', { repo: 'octocat/hello-world', count: 5 }, {}),
    ).rejects.toThrow(/GitHub account not linked/);
  });

  it('rejects an unknown widget name', async () => {
    await expect(
      provider.fetchWidgetData('does_not_exist', {}, { accessToken: 'token-123' }),
    ).rejects.toThrow(/Unknown github widget/);
  });
});
