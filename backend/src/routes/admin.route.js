const { Router } = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const controller = require('../controllers/admin.controller');

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', controller.listUsers);
router.patch('/users/:id', controller.updateUserRole);
router.delete('/users/:id', controller.deleteUser);

module.exports = router;
