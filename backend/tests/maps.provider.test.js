jest.mock('../src/services/maps/client');

const client = require('../src/services/maps/client');
const provider = require('../src/services/maps/provider');

describe('maps provider', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches driving directions between two places', async () => {
    client.getDirections.mockResolvedValue({
      origin: 'Paris, France',
      destination: 'Lyon, France',
      distanceKm: 465.2,
      durationMin: 270,
    });

    const result = await provider.fetchWidgetData('directions', {
      origin: 'Paris',
      destination: 'Lyon',
    });

    expect(client.getDirections).toHaveBeenCalledWith('Paris', 'Lyon');
    expect(result.data.distanceKm).toBe(465.2);
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('fetches a cycling route between two places', async () => {
    client.getCyclingRoute.mockResolvedValue({
      origin: 'Paris, France',
      destination: 'Versailles, France',
      distanceKm: 20.1,
      durationMin: 75,
    });

    const result = await provider.fetchWidgetData('cycling_route', {
      origin: 'Paris',
      destination: 'Versailles',
    });

    expect(client.getCyclingRoute).toHaveBeenCalledWith('Paris', 'Versailles');
    expect(result.data.durationMin).toBe(75);
  });

  it('looks up a place', async () => {
    client.getPlace.mockResolvedValue({ lat: 48.85, lon: 2.35, displayName: 'Paris, France' });

    const result = await provider.fetchWidgetData('place_lookup', { query: 'Paris' });

    expect(client.getPlace).toHaveBeenCalledWith('Paris');
    expect(result.data.displayName).toBe('Paris, France');
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('does_not_exist', {})).rejects.toThrow(
      /Unknown maps widget/,
    );
  });
});
