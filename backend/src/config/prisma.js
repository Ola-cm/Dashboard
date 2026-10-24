const { PrismaClient } = require('@prisma/client');

// Reused across the app instead of instantiated per-request to avoid exhausting DB connections.
const prisma = new PrismaClient();

module.exports = prisma;
