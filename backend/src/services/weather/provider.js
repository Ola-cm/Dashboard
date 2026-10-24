const client = require('./client');

function formatSkyOverview(raw) {
  return {
    city: raw.name,
    condition: raw.weather?.[0]?.main,
    description: raw.weather?.[0]?.description,
    humidity: raw.main?.humidity,
    windSpeed: raw.wind?.speed,
  };
}

const handlers = {
  city_temperature: async (config) => {
    const raw = await client.getCurrentWeather(config.city);
    return { city: raw.name, temperature: raw.main?.temp, feelsLike: raw.main?.feels_like };
  },
  sky_overview: async (config) => formatSkyOverview(await client.getCurrentWeather(config.city)),
  precipitation_forecast: async (config) => {
    const raw = await client.getForecast(config.city, config.days);
    return {
      city: raw.city?.name,
      days: config.days,
      slots: (raw.list || []).map((slot) => ({
        time: slot.dt_txt,
        precipitationProbability: slot.pop,
      })),
    };
  },
};

async function fetchWidgetData(widgetName, config) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown weather widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  const data = await handler(config);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
