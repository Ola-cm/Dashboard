const crypto = require('crypto');
const prisma = require('../config/prisma');
const { getServices } = require('./widgetRegistry');
const providerRegistry = require('./providerRegistry');
const { loadCredentials } = require('./credentialsStore');

const MIN_REFRESH_RATE_SECONDS = 5;
// Mirrors WIDGET_SIZES in frontend/src/widgets/WidgetFrame.jsx.
const VALID_SIZES = ['square', 'wide', 'tall', 'large'];
const DEFAULT_SIZE = 'square';

class DashboardError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function findWidgetDefinition(serviceName, widgetName) {
  const service = getServices().find((s) => s.name === serviceName);
  const widget = service?.widgets.find((w) => w.name === widgetName);
  return widget || null;
}

function isValidParamValue(type, value) {
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'string') return typeof value === 'string' && value.length > 0;
  return false;
}

// The client only ever sends serviceName/widgetName/config as free-form input — every field is
// re-checked against the server-side registry so a tampered request can't store bogus data.
function validateConfig(serviceName, widgetName, config) {
  const widget = findWidgetDefinition(serviceName, widgetName);
  if (!widget) {
    throw new DashboardError(`Unknown widget "${widgetName}" for service "${serviceName}"`, 404);
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new DashboardError('config must be an object');
  }

  for (const param of widget.params) {
    if (!isValidParamValue(param.type, config[param.name])) {
      throw new DashboardError(`config.${param.name} must be a valid ${param.type}`);
    }
  }
}

function validateRefreshRate(refreshRate) {
  if (!Number.isInteger(refreshRate) || refreshRate < MIN_REFRESH_RATE_SECONDS) {
    throw new DashboardError(`refreshRate must be an integer >= ${MIN_REFRESH_RATE_SECONDS}`);
  }
}

function validatePosition(position) {
  if (!position || typeof position !== 'object' || Array.isArray(position)) {
    throw new DashboardError('position must be an object');
  }
}

function validateSize(size) {
  if (!VALID_SIZES.includes(size)) {
    throw new DashboardError(`size must be one of: ${VALID_SIZES.join(', ')}`);
  }
}

function listWidgetInstances(userId) {
  return prisma.widgetInstance.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

async function createWidgetInstance(
  userId,
  { serviceName, widgetName, config, refreshRate, position, size = DEFAULT_SIZE },
) {
  validateConfig(serviceName, widgetName, config);
  validateRefreshRate(refreshRate);
  validatePosition(position);
  validateSize(size);

  return prisma.widgetInstance.create({
    data: { userId, serviceName, widgetName, config, refreshRate, position, size },
  });
}

async function getOwnedWidgetInstance(userId, id) {
  const instance = await prisma.widgetInstance.findUnique({ where: { id } });
  if (!instance || instance.userId !== userId) {
    throw new DashboardError('Widget instance not found', 404);
  }
  return instance;
}

async function updateWidgetInstance(userId, id, updates) {
  const instance = await getOwnedWidgetInstance(userId, id);
  const data = {};

  // The widget itself can be swapped for another one (any service) while editing. The new type is
  // checked against the registry like on creation, and the config is re-validated against the
  // *resulting* widget's params: an old config almost never fits a different widget.
  const serviceName = updates.serviceName ?? instance.serviceName;
  const widgetName = updates.widgetName ?? instance.widgetName;
  const typeChanged = serviceName !== instance.serviceName || widgetName !== instance.widgetName;

  if (typeChanged || updates.config !== undefined) {
    const config = updates.config ?? instance.config;
    validateConfig(serviceName, widgetName, config);
    data.config = config;
  }
  if (typeChanged) {
    data.serviceName = serviceName;
    data.widgetName = widgetName;
  }
  if (updates.refreshRate !== undefined) {
    validateRefreshRate(updates.refreshRate);
    data.refreshRate = updates.refreshRate;
  }
  if (updates.position !== undefined) {
    validatePosition(updates.position);
    data.position = updates.position;
  }
  if (updates.size !== undefined) {
    validateSize(updates.size);
    data.size = updates.size;
  }

  return prisma.widgetInstance.update({ where: { id }, data });
}

async function deleteWidgetInstance(userId, id) {
  await getOwnedWidgetInstance(userId, id);
  await prisma.widgetInstance.delete({ where: { id } });
}

async function fetchInstanceData(instance) {
  const subscription = await prisma.serviceSubscription.findUnique({
    where: { userId_serviceName: { userId: instance.userId, serviceName: instance.serviceName } },
  });
  const credentials = await loadCredentials(subscription);
  return providerRegistry.fetchWidgetData(
    instance.serviceName,
    instance.widgetName,
    instance.config,
    credentials,
  );
}

// Called by the frontend Timer every `refreshRate` seconds for this instance — the actual
// service call (weather/github/...) is entirely delegated to providerRegistry.
async function getWidgetData(userId, id) {
  const instance = await getOwnedWidgetInstance(userId, id);

  try {
    return await fetchInstanceData(instance);
  } catch (err) {
    // 401 is reserved for this API's own auth layer (see middleware/auth.js) — the frontend
    // treats any 401 as "your session expired" and logs the user out. A provider rejecting the
    // request (e.g. GitHub not linked yet) must not trigger that, so it's remapped to 424.
    if (err.status === 401) {
      err.status = 424;
    }
    throw err;
  }
}

async function getShareStatus(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return { shareToken: user.shareToken };
}

async function enableSharing(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.shareToken) {
    return { shareToken: user.shareToken };
  }

  const shareToken = crypto.randomBytes(24).toString('hex');
  await prisma.user.update({ where: { id: userId }, data: { shareToken } });
  return { shareToken };
}

async function disableSharing(userId) {
  await prisma.user.update({ where: { id: userId }, data: { shareToken: null } });
}

function toPublicWidget(instance) {
  return {
    id: instance.id,
    serviceName: instance.serviceName,
    widgetName: instance.widgetName,
    config: instance.config,
    size: instance.size,
    position: instance.position,
  };
}

// Public, read-only: no auth, keyed by the unguessable shareToken instead of a userId. Each
// widget is fetched best-effort — one provider failing (e.g. a revoked token) must not take
// down the rest of the shared dashboard.
async function getSharedDashboard(shareToken) {
  const user = await prisma.user.findUnique({ where: { shareToken } });
  if (!user) {
    throw new DashboardError('Shared dashboard not found', 404);
  }

  const instances = await listWidgetInstances(user.id);
  const widgets = await Promise.all(
    instances.map(async (instance) => {
      try {
        const { data, fetchedAt } = await fetchInstanceData(instance);
        return { ...toPublicWidget(instance), data, fetchedAt, error: null };
      } catch (err) {
        return { ...toPublicWidget(instance), data: null, fetchedAt: null, error: err.message };
      }
    }),
  );

  return { owner: { name: user.name }, widgets };
}

module.exports = {
  listWidgetInstances,
  createWidgetInstance,
  updateWidgetInstance,
  deleteWidgetInstance,
  getWidgetData,
  getShareStatus,
  enableSharing,
  disableSharing,
  getSharedDashboard,
  DashboardError,
};
