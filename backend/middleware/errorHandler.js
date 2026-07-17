// ============================================================
// MIDDLEWARE GLOBAL D'ERREURS — Mylta Academy (Production-Ready)
// Structured logging + JSON responses + Request ID tracing
// ============================================================

const morgan = require('morgan')
const { t } = require('../i18n')

/**
 * Format Morgan personnalisé avec Request ID
 */
const httpLogger = morgan((tokens, req, res) => {
  const status = tokens.status(req, res)
  const method = tokens.method(req, res)
  const url = tokens.url(req, res)
  const time = tokens['response-time'](req, res)
  const date = new Date().toISOString().substring(11, 19)
  const reqId = req.requestId ? ` [${req.requestId.substring(0, 8)}]` : ''

  const statusColor =
    status >= 500 ? '\x1b[31m' :
    status >= 400 ? '\x1b[33m' :
    status >= 300 ? '\x1b[36m' :
    '\x1b[32m'

  const reset = '\x1b[0m'
  const dim = '\x1b[2m'
  const bold = '\x1b[1m'

  return `${dim}[${date}]${reset}${dim}${reqId}${reset} ${bold}${method}${reset} ${url} ${statusColor}${status}${reset} ${dim}${time}ms${reset}`
})

/**
 * Structured error log (JSON en production, human-readable en dev)
 */
function logError(err, req) {
  const isProd = process.env.NODE_ENV === 'production'
  const statusCode = err.status || err.statusCode || 500

  if (isProd) {
    // Structured JSON logging pour ELK/Datadog/CloudWatch
    const logEntry = {
      level: statusCode >= 500 ? 'error' : 'warn',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      message: err.message,
      code: err.code,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }
    console.error(JSON.stringify(logEntry))
  } else {
    // Format lisible en dev
    console.error('\n' + '─'.repeat(60))
    console.error(`❌  ERREUR SERVER  [${new Date().toISOString()}] [${req.requestId || 'no-id'}]`)
    console.error(`    ${req.method} ${req.originalUrl} → HTTP ${statusCode}`)
    console.error(`    Message: ${err.message}`)
    if (err.code) console.error(`    Code: ${err.code}`)
    if (err.stack) {
      console.error(`    Stack:\n${err.stack.split('\n').slice(1, 4).join('\n')}`)
    }
    console.error('─'.repeat(60) + '\n')
  }
}

/**
 * Middleware global de gestion des erreurs Express.
 * Signature 4 arguments obligatoire: (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500
  const lang = req.lang || 'fr'

  // Log structuré
  logError(err, req)

  // ─── Erreurs Prisma spécifiques ────────────────────────────
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: t('errors.duplicate_entry', lang),
      code: 'DUPLICATE_ENTRY',
      requestId: req.requestId,
    })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: t('errors.resource_not_found', lang),
      code: 'NOT_FOUND',
      requestId: req.requestId,
    })
  }
  if (err.code === 'P2003') {
    return res.status(400).json({
      error: t('errors.foreign_key_error', lang),
      code: 'FOREIGN_KEY_ERROR',
      requestId: req.requestId,
    })
  }

  // ─── Erreurs Multer (upload de fichiers) ───────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: t('errors.file_too_large', lang),
      code: 'FILE_TOO_LARGE',
      requestId: req.requestId,
    })
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: t('errors.unexpected_file', lang),
      code: 'UNEXPECTED_FILE_FIELD',
      requestId: req.requestId,
    })
  }

  // ─── Erreurs JWT ───────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: t('auth.token_invalid', lang),
      code: 'INVALID_TOKEN',
      requestId: req.requestId,
    })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: t('auth.token_expired', lang),
      code: 'TOKEN_EXPIRED',
      requestId: req.requestId,
    })
  }

  // ─── Validation Express ────────────────────────────────────
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: t('errors.invalid_json', lang),
      code: 'INVALID_JSON',
      requestId: req.requestId,
    })
  }

  // ─── CORS error ────────────────────────────────────────────
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS: Origin not allowed.',
      code: 'CORS_BLOCKED',
      requestId: req.requestId,
    })
  }

  // ─── Erreur par défaut (JAMAIS exposer le stack au client) ─
  const isProd = process.env.NODE_ENV === 'production'
  res.status(statusCode).json({
    error: isProd && statusCode === 500
      ? t('errors.internal_error', lang)
      : err.message || t('errors.internal_error', lang),
    code: err.code || 'INTERNAL_ERROR',
    requestId: req.requestId,
  })
}

module.exports = { httpLogger, errorHandler }
