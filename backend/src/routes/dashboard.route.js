const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/dashboard.controller');

const router = Router();

router.use(requireAuth);

router.get('/widgets', controller.list);
router.post('/widgets', controller.create);
router.patch('/widgets/:id', controller.update);
router.delete('/widgets/:id', controller.remove);
router.get('/widgets/:id/data', controller.data);

router.get('/share', controller.getShare);
router.post('/share', controller.enableShare);
router.delete('/share', controller.disableShare);

module.exports = router;
