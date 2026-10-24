jest.mock('../src/services/places/client');

const client = require('../src/services/places/client');
const places = require('../src/services/places');

describe('places autocomplete', () => {
  afterEach(() => {
    jest.clearAllMocks();
    places.clearCache();
  });

  it('returns no suggestions for a query shorter than 2 characters', async () => {
    const result = await places.autocomplete('p');

    expect(result).toEqual([]);
    expect(client.searchPlaces).not.toHaveBeenCalled();
  });

  it('returns no suggestions for an empty or missing query', async () => {
    expect(await places.autocomplete('')).toEqual([]);
    expect(await places.autocomplete(undefined)).toEqual([]);
    expect(client.searchPlaces).not.toHaveBeenCalled();
  });

  it('searches places for a query of 2 characters or more', async () => {
    client.searchPlaces.mockResolvedValue([{ label: 'Paris, France', lat: 48.85, lon: 2.35 }]);

    const result = await places.autocomplete('  Paris  ');

    expect(client.searchPlaces).toHaveBeenCalledWith('Paris');
    expect(result).toEqual([{ label: 'Paris, France', lat: 48.85, lon: 2.35 }]);
  });

  it('caches results for the same query, case-insensitively', async () => {
    client.searchPlaces.mockResolvedValue([{ label: 'Paris, France', lat: 48.85, lon: 2.35 }]);

    await places.autocomplete('Paris');
    await places.autocomplete('paris');

    expect(client.searchPlaces).toHaveBeenCalledTimes(1);
  });
});
