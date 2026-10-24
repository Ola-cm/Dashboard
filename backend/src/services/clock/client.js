// Current time per timezone from timeapi.io, a free, keyless API. The server's own clock is not
// the source: the widget shows what the external service reports for the requested IANA zone.
const axios = require('axios');
const { withRetry } = require('../httpClient');

const TIME_API_URL = 'https://timeapi.io/api/Time/current/zone';
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toTimeParts(timezone, data) {
  return {
    timezone,
    hours: data.hour,
    minutes: data.minute,
    seconds: data.seconds,
    weekday: data.dayOfWeek,
    date: `${MONTHS[data.month - 1]} ${data.day}, ${data.year}`,
  };
}

async function getTimeParts(timezone) {
  try {
    const { data } = await withRetry(() =>
      axios.get(TIME_API_URL, { params: { timeZone: timezone }, timeout: 10000 }),
    );
    return toTimeParts(timezone, data);
  } catch (err) {
    // The API answers 400 for a name it doesn't know as an IANA timezone.
    if (err.response?.status === 400) {
      const bad = new Error(`Unknown timezone "${timezone}"`);
      bad.status = 400;
      throw bad;
    }
    const failure = new Error('The time service could not be reached');
    failure.status = 424;
    throw failure;
  }
}

module.exports = { getTimeParts, toTimeParts };
