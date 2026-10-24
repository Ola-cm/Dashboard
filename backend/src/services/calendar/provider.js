// No client.js here — like clock, there's nothing external to call. Everything is computed
// from the widget's own config.
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function buildMonthView(month, year) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startWeekday = firstDay.getUTCDay(); // 0 = Sunday

  const today = new Date();
  const isCurrentMonth =
    today.getUTCFullYear() === firstDay.getUTCFullYear() &&
    today.getUTCMonth() === firstDay.getUTCMonth();

  const weeks = [];
  let week = new Array(startWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    weeks.push([...week, ...new Array(7 - week.length).fill(null)]);
  }

  return {
    month,
    year,
    monthName: MONTH_NAMES[(((month - 1) % 12) + 12) % 12],
    weeks,
    today: isCurrentMonth ? today.getUTCDate() : null,
  };
}

function buildCountdown(label, targetDate) {
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) {
    const err = new Error(`Invalid target_date "${targetDate}"`);
    err.status = 400;
    throw err;
  }
  const daysRemaining = Math.ceil((target.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return { label, targetDate, daysRemaining };
}

function buildDaysSince(label, startDate) {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    const err = new Error(`Invalid start_date "${startDate}"`);
    err.status = 400;
    throw err;
  }
  const daysElapsed = Math.floor((Date.now() - start.getTime()) / (24 * 60 * 60 * 1000));
  return { label, startDate, daysElapsed };
}

const handlers = {
  month_view: (config) => buildMonthView(config.month, config.year),
  countdown: (config) => buildCountdown(config.label, config.target_date),
  days_since: (config) => buildDaysSince(config.label, config.start_date),
};

async function fetchWidgetData(widgetName, config) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown calendar widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  const data = handler(config);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
