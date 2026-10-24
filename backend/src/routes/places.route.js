const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/places.controller');

const router = Router();

// Behind auth like every other data-fetching route — this proxies a third-party API on the
// user's behalf and shouldn't be left open to anonymous traffic.
router.get('/autocomplete', requireAuth, controller.autocomplete);

module.exports = router;
