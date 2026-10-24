const client = require('./client');

// 24 hours is plenty for a kitchen/pomodoro-style timer and keeps the display to HH:MM:SS.
const MAX_TIMER_MINUTES = 24 * 60;

// The timer's running state (started, paused, time left) lives in the browser — it changes every
// second and on every click, which a poll every refreshRate seconds can't follow. The server only
// owns what the user configured: it validates the duration and hands it back in seconds.
function getTimerSettings({ label, minutes, seconds }) {
  if (minutes < 0 || minutes > MAX_TIMER_MINUTES || seconds < 0 || seconds > 59) {
    const err = new Error(
      `Timer minutes must be between 0 and ${MAX_TIMER_MINUTES}, seconds between 0 and 59`,
    );
    err.status = 400;
    throw err;
  }
  const durationSeconds = minutes * 60 + seconds;
  if (durationSeconds === 0) {
    const err = new Error('Timer duration must be longer than 0 seconds');
    err.status = 400;
    throw err;
  }
  return { label, durationSeconds };
}

const handlers = {
  digital_clock: (config) => client.getTimeParts(config.timezone),
  analog_clock: (config) => client.getTimeParts(config.timezone),
  timer: (config) => getTimerSettings(config),
};

async function fetchWidgetData(widgetName, config) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown clock widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  const data = await handler(config);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
