const { registerService, getServices, resetRegistry } = require('../src/services/widgetRegistry');

describe('widgetRegistry', () => {
  afterEach(() => resetRegistry());

  it('registers a service with its widgets', () => {
    registerService('weather', [
      {
        name: 'city_temperature',
        description: 'Display temperature for a city',
        params: [{ name: 'city', type: 'string' }],
      },
    ]);

    expect(getServices()).toEqual([
      {
        name: 'weather',
        widgets: [
          {
            name: 'city_temperature',
            description: 'Display temperature for a city',
            params: [{ name: 'city', type: 'string' }],
          },
        ],
      },
    ]);
  });

  it('rejects a widget with no configurable params', () => {
    expect(() =>
      registerService('weather', [{ name: 'sky_overview', description: 'no config', params: [] }]),
    ).toThrow(/at least one configurable param/);
  });

  it('rejects a param with an unsupported type', () => {
    expect(() =>
      registerService('rss', [
        { name: 'article_list', params: [{ name: 'link', type: 'boolean' }] },
      ]),
    ).toThrow(/unsupported type/);
  });

  it('rejects a service with no widgets', () => {
    expect(() => registerService('empty', [])).toThrow(/at least one widget/);
  });
});
