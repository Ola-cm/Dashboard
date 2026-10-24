const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/services.controller');

const router = Router();

router.get('/', requireAuth, controller.list);
router.get('/:service/oauth/start', requireAuth, controller.oauthStart);
router.get('/:service/oauth/callback', controller.oauthCallback);
router.post('/:name/subscribe', requireAuth, controller.subscribe);
router.delete('/:name/subscribe', requireAuth, controller.unsubscribe);

module.exports = router;
