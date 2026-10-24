const dashboardService = require('../services/dashboardService');

async function list(req, res, next) {
  try {
    const widgets = await dashboardService.listWidgetInstances(req.user.id);
    res.json({ widgets });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const widget = await dashboardService.createWidgetInstance(req.user.id, req.body);
    res.status(201).json({ widget });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const widget = await dashboardService.updateWidgetInstance(
      req.user.id,
      req.params.id,
      req.body,
    );
    res.json({ widget });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await dashboardService.deleteWidgetInstance(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function data(req, res, next) {
  try {
    const result = await dashboardService.getWidgetData(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getShare(req, res, next) {
  try {
    const result = await dashboardService.getShareStatus(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function enableShare(req, res, next) {
  try {
    const result = await dashboardService.enableSharing(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function disableShare(req, res, next) {
  try {
    await dashboardService.disableSharing(req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove, data, getShare, enableShare, disableShare };
