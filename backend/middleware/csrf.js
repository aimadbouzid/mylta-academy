// ============================================================
// MIDDLEWARE CSRF — Mylta Academy (Production-Ready)
// Double Submit Cookie Pattern
// ============================================================

const crypto = require('crypto')

const CSRF_COOKIE_NAME = '_csrf'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32

// Paths exempted from CSRF (webhooks use HMAC, health is GET-only)
const EXEMPT_PATHS = [
  '/api/payments/edahabia/webhook',
  '/api/health',
]

/**
 * Generates a cryptographically secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Cookie options for the CSRF token
 * NOT HttpOnly — frontend must be able to read it to send in header
 */
function getCsrfCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: false, // Frontend must read this
    secure: isProd,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  }
}

/**
 * Middleware: Ensure a CSRF cookie exists.
 * Sets one if absent (on every request).
 */
const ensureCsrfToken = (req, res, next) => {
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken()
    res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions())
  }
  next()
}

/**
 * Middleware: Validate CSRF token on mutating requests (POST, PUT, DELETE, PATCH).
 * Compares the cookie value against the header value.
 */
const validateCsrf = (req, res, next) => {
  // Skip safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(req.method)) {
    return next()
  }

  // Skip exempt paths (webhooks)
  if (EXEMPT_PATHS.some(p => req.path.startsWith(p) || req.originalUrl.startsWith(p))) {
    return next()
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME]
  const headerToken = req.headers[CSRF_HEADER_NAME]

  if (!cookieToken || !headerToken) {
    console.warn(JSON.stringify({
      event: 'CSRF_MISSING',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))
    return res.status(403).json({
      error: 'CSRF token missing.',
      code: 'CSRF_MISSING',
    })
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return res.status(403).json({
      error: 'CSRF token invalid.',
      code: 'CSRF_INVALID',
    })
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(cookieToken, 'utf8'),
    Buffer.from(headerToken, 'utf8')
  )

  if (!valid) {
    console.warn(JSON.stringify({
      event: 'CSRF_INVALID',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))
    return res.status(403).json({
      error: 'CSRF token invalid.',
      code: 'CSRF_INVALID',
    })
  }

  next()
}

module.exports = {
  ensureCsrfToken,
  validateCsrf,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
}
