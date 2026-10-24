const { Router } = require('express');
const controller = require('../controllers/public.controller');

const router = Router();

// No requireAuth: this is the whole point — an unguessable token stands in for a session.
router.get('/dashboards/:token', controller.getSharedDashboard);

module.exports = router;
