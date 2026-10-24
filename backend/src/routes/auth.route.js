const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  controller.register,
);

router.get('/confirm/:token', controller.confirm);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  controller.login,
);

router.get('/me', requireAuth, controller.me);

router.patch(
  '/me',
  requireAuth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('newPassword').optional().isString(),
    body('currentPassword').optional().isString(),
  ],
  controller.updateMe,
);

router.delete(
  '/me',
  requireAuth,
  [body('password').notEmpty().withMessage('Password is required to delete your account')],
  controller.deleteMe,
);

module.exports = router;
