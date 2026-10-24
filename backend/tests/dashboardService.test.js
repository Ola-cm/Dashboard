jest.mock('../src/config/prisma', () => ({
  widgetInstance: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  serviceSubscription: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('../src/services/providerRegistry');
jest.mock('../src/services/credentialsStore');

const prisma = require('../src/config/prisma');
const dashboardService = require('../src/services/dashboardService');
const providerRegistry = require('../src/services/providerRegistry');
const { loadCredentials } = require('../src/services/credentialsStore');
const { registerService, resetRegistry } = require('../src/services/widgetRegistry');

const USER_ID = 'user-1';

beforeEach(() => {
  registerService('rss', [
    {
      name: 'article_list',
      description: 'Last articles from a feed',
      params: [
        { name: 'link', type: 'string' },
        { name: 'number', type: 'integer' },
      ],
    },
  ]);
});

afterEach(() => {
  resetRegistry();
  jest.clearAllMocks();
});

describe('createWidgetInstance', () => {
  it('rejects an unknown widget', async () => {
    await expect(
      dashboardService.createWidgetInstance(USER_ID, {
        serviceName: 'rss',
        widgetName: 'does_not_exist',
        config: {},
        refreshRate: 60,
        position: { x: 0, y: 0 },
      }),
    ).rejects.toThrow(/Unknown widget/);
  });

  it('rejects a config missing a declared param', async () => {
    await expect(
      dashboardService.createWidgetInstance(USER_ID, {
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml' },
        refreshRate: 60,
        position: { x: 0, y: 0 },
      }),
    ).rejects.toThrow(/config.number/);
  });

  it('rejects a config with the wrong param type', async () => {
    await expect(
      dashboardService.createWidgetInstance(USER_ID, {
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml', number: 'five' },
        refreshRate: 60,
        position: { x: 0, y: 0 },
      }),
    ).rejects.toThrow(/config.number/);
  });

  it('rejects a refresh rate below the minimum', async () => {
    await expect(
      dashboardService.createWidgetInstance(USER_ID, {
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml', number: 5 },
        refreshRate: 1,
        position: { x: 0, y: 0 },
      }),
    ).rejects.toThrow(/refreshRate/);
  });

  it('creates the instance when config and refreshRate are valid', async () => {
    prisma.widgetInstance.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'w1', ...data }),
    );

    const widget = await dashboardService.createWidgetInstance(USER_ID, {
      serviceName: 'rss',
      widgetName: 'article_list',
      config: { link: 'https://example.com/feed.xml', number: 5 },
      refreshRate: 60,
      position: { x: 10, y: 20 },
    });

    expect(widget.id).toBe('w1');
    expect(prisma.widgetInstance.create).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml', number: 5 },
        refreshRate: 60,
        position: { x: 10, y: 20 },
        size: 'square',
      },
    });
  });

  it('rejects an invalid size', async () => {
    await expect(
      dashboardService.createWidgetInstance(USER_ID, {
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml', number: 5 },
        refreshRate: 60,
        position: { x: 0, y: 0 },
        size: 'huge',
      }),
    ).rejects.toThrow(/size must be one of/);
  });

  it('lets two instances of the same widget hold different configs', async () => {
    prisma.widgetInstance.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: `w-${data.config.link}`, ...data }),
    );

    const first = await dashboardService.createWidgetInstance(USER_ID, {
      serviceName: 'rss',
      widgetName: 'article_list',
      config: { link: 'https://a.example.com/feed.xml', number: 5 },
      refreshRate: 60,
      position: { x: 0, y: 0 },
    });
    const second = await dashboardService.createWidgetInstance(USER_ID, {
      serviceName: 'rss',
      widgetName: 'article_list',
      config: { link: 'https://b.example.com/feed.xml', number: 10 },
      refreshRate: 30,
      position: { x: 100, y: 0 },
    });

    expect(first.config).not.toEqual(second.config);
  });
});

describe('updateWidgetInstance', () => {
  it('rejects updating a widget instance owned by another user', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({ id: 'w1', userId: 'someone-else' });

    await expect(
      dashboardService.updateWidgetInstance(USER_ID, 'w1', { refreshRate: 30 }),
    ).rejects.toThrow(/not found/);
  });

  it('validates the new config against the widget already stored', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({
      id: 'w1',
      userId: USER_ID,
      serviceName: 'rss',
      widgetName: 'article_list',
    });

    await expect(
      dashboardService.updateWidgetInstance(USER_ID, 'w1', { config: { link: 'x' } }),
    ).rejects.toThrow(/config.number/);
  });

  it('updates position without touching config', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({
      id: 'w1',
      userId: USER_ID,
      serviceName: 'rss',
      widgetName: 'article_list',
    });
    prisma.widgetInstance.update.mockResolvedValue({ id: 'w1', position: { x: 5, y: 5 } });

    await dashboardService.updateWidgetInstance(USER_ID, 'w1', { position: { x: 5, y: 5 } });

    expect(prisma.widgetInstance.update).toHaveBeenCalledWith({
      where: { id: 'w1' },
      data: { position: { x: 5, y: 5 } },
    });
  });

  describe('changing the widget type', () => {
    const storedRss = {
      id: 'w1',
      userId: USER_ID,
      serviceName: 'rss',
      widgetName: 'article_list',
      config: { link: 'https://example.com/feed', number: 5 },
    };

    beforeEach(() => {
      registerService('weather', [
        {
          name: 'city_temperature',
          description: 'Temperature for a city',
          params: [{ name: 'city', type: 'string' }],
        },
      ]);
      prisma.widgetInstance.findUnique.mockResolvedValue(storedRss);
      prisma.widgetInstance.update.mockResolvedValue({ id: 'w1' });
    });

    it('swaps the service, widget and config in one update', async () => {
      await dashboardService.updateWidgetInstance(USER_ID, 'w1', {
        serviceName: 'weather',
        widgetName: 'city_temperature',
        config: { city: 'Cotonou' },
      });

      expect(prisma.widgetInstance.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: { serviceName: 'weather', widgetName: 'city_temperature', config: { city: 'Cotonou' } },
      });
    });

    it('rejects a type change that keeps the old, now incompatible config', async () => {
      await expect(
        dashboardService.updateWidgetInstance(USER_ID, 'w1', {
          serviceName: 'weather',
          widgetName: 'city_temperature',
        }),
      ).rejects.toThrow(/config.city/);
      expect(prisma.widgetInstance.update).not.toHaveBeenCalled();
    });

    it('rejects switching to a widget that does not exist', async () => {
      await expect(
        dashboardService.updateWidgetInstance(USER_ID, 'w1', {
          serviceName: 'weather',
          widgetName: 'does_not_exist',
          config: { city: 'Cotonou' },
        }),
      ).rejects.toThrow(/Unknown widget/);
      expect(prisma.widgetInstance.update).not.toHaveBeenCalled();
    });
  });
});

describe('deleteWidgetInstance', () => {
  it('rejects deleting a widget instance owned by another user', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({ id: 'w1', userId: 'someone-else' });

    await expect(dashboardService.deleteWidgetInstance(USER_ID, 'w1')).rejects.toThrow(/not found/);
    expect(prisma.widgetInstance.delete).not.toHaveBeenCalled();
  });

  it('deletes an owned widget instance', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({ id: 'w1', userId: USER_ID });

    await dashboardService.deleteWidgetInstance(USER_ID, 'w1');

    expect(prisma.widgetInstance.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
  });
});

describe('getWidgetData', () => {
  it('rejects fetching data for a widget instance owned by another user', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({ id: 'w1', userId: 'someone-else' });

    await expect(dashboardService.getWidgetData(USER_ID, 'w1')).rejects.toThrow(/not found/);
    expect(providerRegistry.fetchWidgetData).not.toHaveBeenCalled();
  });

  it('loads credentials for the instance service and delegates to providerRegistry', async () => {
    const instance = {
      id: 'w1',
      userId: USER_ID,
      serviceName: 'rss',
      widgetName: 'article_list',
      config: { link: 'https://example.com/feed.xml', number: 5 },
    };
    prisma.widgetInstance.findUnique.mockResolvedValue(instance);
    prisma.serviceSubscription.findUnique.mockResolvedValue({ id: 'sub-1', credentials: null });
    loadCredentials.mockResolvedValue(null);
    providerRegistry.fetchWidgetData.mockResolvedValue({ data: { items: [] }, fetchedAt: 'now' });

    const result = await dashboardService.getWidgetData(USER_ID, 'w1');

    expect(prisma.serviceSubscription.findUnique).toHaveBeenCalledWith({
      where: { userId_serviceName: { userId: USER_ID, serviceName: 'rss' } },
    });
    expect(providerRegistry.fetchWidgetData).toHaveBeenCalledWith(
      'rss',
      'article_list',
      instance.config,
      null,
    );
    expect(result).toEqual({ data: { items: [] }, fetchedAt: 'now' });
  });

  it('remaps a 401 from the provider to 424 so the frontend does not log the user out', async () => {
    prisma.widgetInstance.findUnique.mockResolvedValue({
      id: 'w1',
      userId: USER_ID,
      serviceName: 'github',
      widgetName: 'recent_commits',
      config: { repo: 'foo/bar', count: 5 },
    });
    prisma.serviceSubscription.findUnique.mockResolvedValue(null);
    loadCredentials.mockResolvedValue(null);
    const providerError = new Error('GitHub account not linked');
    providerError.status = 401;
    providerRegistry.fetchWidgetData.mockRejectedValue(providerError);

    const rejection = await dashboardService.getWidgetData(USER_ID, 'w1').catch((err) => err);

    expect(rejection.message).toBe('GitHub account not linked');
    expect(rejection.status).toBe(424);
  });
});

describe('sharing', () => {
  it('reports null when sharing has never been enabled', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: USER_ID, shareToken: null });

    const result = await dashboardService.getShareStatus(USER_ID);

    expect(result).toEqual({ shareToken: null });
  });

  it('generates and persists a token the first time sharing is enabled', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: USER_ID, shareToken: null });

    const result = await dashboardService.enableSharing(USER_ID);

    expect(result.shareToken).toEqual(expect.any(String));
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER_ID },
      data: { shareToken: result.shareToken },
    });
  });

  it('is idempotent: enabling sharing twice keeps the same token', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: USER_ID, shareToken: 'already-shared' });

    const result = await dashboardService.enableSharing(USER_ID);

    expect(result).toEqual({ shareToken: 'already-shared' });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('clears the token when disabling sharing', async () => {
    await dashboardService.disableSharing(USER_ID);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER_ID },
      data: { shareToken: null },
    });
  });

  it('rejects an unknown share token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const rejection = await dashboardService.getSharedDashboard('missing').catch((err) => err);

    expect(rejection.status).toBe(404);
  });

  it("returns the owner's widget layout with live data for a valid share token", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: USER_ID, name: 'Olaife', shareToken: 'tok' });
    prisma.widgetInstance.findMany.mockResolvedValue([
      {
        id: 'w1',
        userId: USER_ID,
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml', number: 5 },
        size: 'wide',
        position: { x: 0, y: 0 },
      },
    ]);
    prisma.serviceSubscription.findUnique.mockResolvedValue(null);
    loadCredentials.mockResolvedValue(null);
    providerRegistry.fetchWidgetData.mockResolvedValue({ data: { items: [] }, fetchedAt: 'now' });

    const result = await dashboardService.getSharedDashboard('tok');

    expect(result.owner).toEqual({ name: 'Olaife' });
    expect(result.widgets).toEqual([
      {
        id: 'w1',
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml', number: 5 },
        size: 'wide',
        position: { x: 0, y: 0 },
        data: { items: [] },
        fetchedAt: 'now',
        error: null,
      },
    ]);
  });

  it('keeps other widgets when one fails, reporting its error instead', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: USER_ID, name: 'Olaife', shareToken: 'tok' });
    prisma.widgetInstance.findMany.mockResolvedValue([
      {
        id: 'w1',
        userId: USER_ID,
        serviceName: 'rss',
        widgetName: 'article_list',
        config: { link: 'https://example.com/feed.xml', number: 5 },
        size: 'wide',
        position: { x: 0, y: 0 },
      },
    ]);
    prisma.serviceSubscription.findUnique.mockResolvedValue(null);
    loadCredentials.mockResolvedValue(null);
    providerRegistry.fetchWidgetData.mockRejectedValue(new Error('feed unreachable'));

    const result = await dashboardService.getSharedDashboard('tok');

    expect(result.widgets[0].data).toBeNull();
    expect(result.widgets[0].error).toBe('feed unreachable');
  });
});
