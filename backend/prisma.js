// ============================================================
// PRISMA SINGLETON — Mylta Academy (Production-Ready)
// Connection pooling + slow query logging
// ============================================================

const { PrismaClient } = require('@prisma/client')

const isProd = process.env.NODE_ENV === 'production'

/** @type {PrismaClient} */
let prisma

const prismaOptions = {
  log: isProd
    ? ['warn', 'error']
    : ['query', 'warn', 'error'],
}

if (isProd) {
  prisma = new PrismaClient(prismaOptions)
} else {
  // En dev, réutiliser l'instance pour éviter l'épuisement des connexions lors du hot-reload
  if (!global.__prisma) {
    global.__prisma = new PrismaClient(prismaOptions)
  }
  prisma = global.__prisma
}

// Middleware pour logger les slow queries (> 200ms) en développement
if (!isProd) {
  prisma.$use(async (params, next) => {
    const before = Date.now()
    const result = await next(params)
    const after = Date.now()
    const duration = after - before

    if (duration > 200) {
      console.warn(
        `\x1b[33m⚠️  [SLOW QUERY] ${params.model}.${params.action} took ${duration}ms\x1b[0m`
      )
    }

    return result
  })
}

module.exports = prisma
