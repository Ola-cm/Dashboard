const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { jwtSecret, jwtExpiresIn, adminEmails } = require('../config/env');
const { sendConfirmationEmail } = require('./mailer');

const PASSWORD_MIN_LENGTH = 8;
const SALT_ROUNDS = 10;

class AuthError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function toPublicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

async function register({ email, password, name }) {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new AuthError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const confirmationToken = crypto.randomBytes(32).toString('hex');
  const role = adminEmails.includes(email.toLowerCase()) ? 'ADMIN' : 'USER';

  const user = await prisma.user.create({
    data: { email, name, passwordHash, confirmationToken, role },
  });

  try {
    await sendConfirmationEmail(email, confirmationToken);
  } catch (err) {
    // Account creation must not fail just because the mail server is unreachable (e.g. running
    // the backend outside Docker without MailHog) — fall back to logging the link.
    console.warn(`[auth] Could not send confirmation email to ${email}: ${err.message}`);
    console.log(`[auth] Confirm ${email} with token: ${confirmationToken}`);
  }

  return { id: user.id, email: user.email, name: user.name };
}

async function confirm(token) {
  const user = await prisma.user.findUnique({ where: { confirmationToken: token } });
  if (!user) {
    throw new AuthError('Invalid or expired confirmation token', 404);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isConfirmed: true, confirmationToken: null },
  });
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new AuthError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthError('Invalid email or password', 401);
  }

  if (!user.isConfirmed) {
    throw new AuthError('Please confirm your email before logging in', 403);
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  return { token, user: toPublicUser(user) };
}

async function assertPassword(user, password) {
  if (!user.passwordHash || !(await bcrypt.compare(password || '', user.passwordHash))) {
    throw new AuthError('Incorrect password', 403);
  }
}

// The name can be changed freely; changing the email or the password requires the current
// password (same reasoning as deleteAccount below). A new email must be confirmed again, exactly
// like at registration: the current session keeps working, but the next login needs the new
// address confirmed — so a typo can still be fixed from this same session.
async function updateAccount(user, { name, email, newPassword, currentPassword }) {
  const data = {};
  if (name !== undefined && name !== user.name) {
    data.name = name;
  }

  const emailChanged = email !== undefined && email !== user.email;
  if (emailChanged || newPassword !== undefined) {
    await assertPassword(user, currentPassword);
  }

  if (emailChanged) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== user.id) {
      throw new AuthError('An account with this email already exists', 409);
    }
    data.email = email;
    data.isConfirmed = false;
    data.confirmationToken = crypto.randomBytes(32).toString('hex');
  }

  if (newPassword !== undefined) {
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      throw new AuthError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
    }
    data.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  if (Object.keys(data).length === 0) {
    throw new AuthError('Nothing to update');
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });

  if (emailChanged) {
    try {
      await sendConfirmationEmail(email, data.confirmationToken);
    } catch (err) {
      console.warn(`[auth] Could not send confirmation email to ${email}: ${err.message}`);
      console.log(`[auth] Confirm ${email} with token: ${data.confirmationToken}`);
    }
  }

  return { user: toPublicUser(updated), emailChanged };
}

// Irreversible, so the password is asked again even though the request is already authenticated —
// a stolen or left-open session shouldn't be enough to wipe the account. A wrong password is a
// 403, not a 401: the frontend treats any 401 as an expired session and logs the user out.
async function deleteAccount(user, password) {
  await assertPassword(user, password);

  if (user.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) {
      throw new AuthError(
        "You're the only admin — promote another user to admin before deleting your account",
        409,
      );
    }
  }

  // Subscriptions (with their encrypted OAuth tokens) and widget instances cascade with the user.
  await prisma.user.delete({ where: { id: user.id } });
}

module.exports = {
  register,
  confirm,
  login,
  updateAccount,
  deleteAccount,
  toPublicUser,
  AuthError,
};
