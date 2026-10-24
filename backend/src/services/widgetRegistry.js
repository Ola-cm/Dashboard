// Central registry every service definition feeds into.
// Each service (weather, github, rss, ...) registers itself once, at startup, via
// `registerService`. The /about.json endpoint just reads back whatever is registered here —
// it never needs to know about individual services.
const VALID_PARAM_TYPES = ['integer', 'string'];

const services = new Map();

function validateWidget(widget) {
  if (!widget || typeof widget.name !== 'string' || !widget.name) {
    throw new Error('Widget must have a non-empty "name"');
  }
  if (!Array.isArray(widget.params) || widget.params.length === 0) {
    throw new Error(`Widget "${widget.name}" must declare at least one configurable param`);
  }
  for (const param of widget.params) {
    if (typeof param.name !== 'string' || !param.name) {
      throw new Error(`Widget "${widget.name}" has a param with no name`);
    }
    if (!VALID_PARAM_TYPES.includes(param.type)) {
      throw new Error(
        `Widget "${widget.name}" param "${param.name}" has unsupported type "${param.type}"`,
      );
    }
  }
}

function registerService(name, widgets) {
  if (typeof name !== 'string' || !name) {
    throw new Error('Service must have a non-empty "name"');
  }
  if (!Array.isArray(widgets) || widgets.length === 0) {
    throw new Error(`Service "${name}" must declare at least one widget`);
  }
  widgets.forEach(validateWidget);

  services.set(name, { name, widgets });
}

function getServices() {
  return Array.from(services.values());
}

// Test-only: services are registered once at module load in real usage, but tests need
// a clean slate between cases.
function resetRegistry() {
  services.clear();
}

module.exports = { registerService, getServices, resetRegistry, VALID_PARAM_TYPES };
