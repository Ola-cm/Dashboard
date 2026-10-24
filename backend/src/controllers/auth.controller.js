const { validationResult } = require('express-validator');
const authService = require('../services/authService');

function respondWithValidationErrors(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return false;
  }
  res.status(400).json({ error: errors.array()[0].msg });
  return true;
}

async function register(req, res, next) {
  if (respondWithValidationErrors(req, res)) return;
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function confirm(req, res, next) {
  try {
    await authService.confirm(req.params.token);
    res.json({ message: 'Account confirmed, you can now log in' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  if (respondWithValidationErrors(req, res)) return;
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.json({ user: authService.toPublicUser(req.user) });
}

async function updateMe(req, res, next) {
  if (respondWithValidationErrors(req, res)) return;
  try {
    const { name, email, newPassword, currentPassword } = req.body;
    const result = await authService.updateAccount(req.user, {
      name,
      email,
      newPassword,
      currentPassword,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  if (respondWithValidationErrors(req, res)) return;
  try {
    await authService.deleteAccount(req.user, req.body.password);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { register, confirm, login, me, updateMe, deleteMe };
