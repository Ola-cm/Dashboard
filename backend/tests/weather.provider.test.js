jest.mock('../src/services/weather/client');

const client = require('../src/services/weather/client');
const provider = require('../src/services/weather/provider');

describe('weather provider', () => {
  afterEach(() => jest.clearAllMocks());

  it('formats city_temperature from the current weather response', async () => {
    client.getCurrentWeather.mockResolvedValue({
      name: 'Cotonou',
      main: { temp: 29, feels_like: 32 },
    });

    const result = await provider.fetchWidgetData('city_temperature', { city: 'Cotonou' });

    expect(client.getCurrentWeather).toHaveBeenCalledWith('Cotonou');
    expect(result.data).toEqual({ city: 'Cotonou', temperature: 29, feelsLike: 32 });
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it('formats precipitation_forecast from the forecast response', async () => {
    client.getForecast.mockResolvedValue({
      city: { name: 'Cotonou' },
      list: [{ dt_txt: '2026-09-16 12:00:00', pop: 0.4 }],
    });

    const result = await provider.fetchWidgetData('precipitation_forecast', {
      city: 'Cotonou',
      days: 1,
    });

    expect(client.getForecast).toHaveBeenCalledWith('Cotonou', 1);
    expect(result.data).toEqual({
      city: 'Cotonou',
      days: 1,
      slots: [{ time: '2026-09-16 12:00:00', precipitationProbability: 0.4 }],
    });
  });

  it('rejects an unknown widget name', async () => {
    await expect(provider.fetchWidgetData('does_not_exist', {})).rejects.toThrow(
      /Unknown weather widget/,
    );
  });
});
