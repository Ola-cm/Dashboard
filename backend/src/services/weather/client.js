const axios = require('axios');
const { openWeatherApiKey, openWeatherBaseUrl } = require('../../config/env');
const { withRetry } = require('../httpClient');

async function getCurrentWeather(city) {
  const { data } = await withRetry(() =>
    axios.get(`${openWeatherBaseUrl}/weather`, {
      params: { q: city, appid: openWeatherApiKey, units: 'metric' },
    }),
  );
  return data;
}

async function getForecast(city, days) {
  const { data } = await withRetry(() =>
    // OpenWeather's free forecast endpoint returns 3-hour slots, 8 per day.
    axios.get(`${openWeatherBaseUrl}/forecast`, {
      params: { q: city, appid: openWeatherApiKey, units: 'metric', cnt: days * 8 },
    }),
  );
  return data;
}

module.exports = { getCurrentWeather, getForecast };
