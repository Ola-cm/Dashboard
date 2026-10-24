const prisma = require('../config/prisma');

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  isConfirmed: true,
  createdAt: true,
};

async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: PUBLIC_FIELDS,
      orderBy: { createdAt: 'asc' },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function assertUserExists(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.user.id) {
      const err = new Error("You can't change your own role");
      err.status = 403;
      throw err;
    }
    if (role !== 'USER' && role !== 'ADMIN') {
      const err = new Error('role must be "USER" or "ADMIN"');
      err.status = 400;
      throw err;
    }
    await assertUserExists(id);

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: PUBLIC_FIELDS,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      const err = new Error("You can't delete your own account");
      err.status = 403;
      throw err;
    }
    await assertUserExists(id);

    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, updateUserRole, deleteUser };
