// No client.js here — like clock and calendar, there's nothing external to call. The note's
// content is entered directly as config; the "fetch" just reshapes it for the Display component.
function buildStickyNote(title, content) {
  return { title, content };
}

function buildChecklist(title, items) {
  const list = (items || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  return { title, items: list };
}

const handlers = {
  sticky_note: (config) => buildStickyNote(config.title, config.content),
  checklist: (config) => buildChecklist(config.title, config.items),
};

async function fetchWidgetData(widgetName, config) {
  const handler = handlers[widgetName];
  if (!handler) {
    const err = new Error(`Unknown notes widget "${widgetName}"`);
    err.status = 400;
    throw err;
  }
  const data = handler(config);
  return { data, fetchedAt: new Date().toISOString() };
}

module.exports = { fetchWidgetData };
