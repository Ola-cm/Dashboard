const dashboardService = require('../services/dashboardService');

async function getSharedDashboard(req, res, next) {
  try {
    const result = await dashboardService.getSharedDashboard(req.params.token);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSharedDashboard };
