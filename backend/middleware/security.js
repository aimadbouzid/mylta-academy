// ============================================================
// MIDDLEWARE SÉCURITÉ — Mylta Academy (Production-Ready, Hardened)
// XSS Sanitization, Security Headers, Input Validation,
// Request Timeout, Anti-Enumeration, Payload Guards,
// CSRF Protection, Path Traversal Guard, NoSQL Injection Guard,
// File Type Validation (magic bytes)
// ============================================================

const xss = require('xss')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const { security } = require('../securityLogger')

// ─── XSS Options ─────────────────────────────────────────────
const xssOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
}

/**
 * Nettoie récursivement toutes les valeurs string d'un objet
 */
function sanitizeObject(obj, depth = 0) {
  // Protection contre la recursion infinie (prototype pollution)
  if (depth > 10) return obj

  if (typeof obj === 'string') {
    return xss(obj, xssOptions)
  }
  if (Array.isArray(obj)) {
    // Limiter la taille des tableaux
    if (obj.length > 1000) return obj.slice(0, 1000).map(item => sanitizeObject(item, depth + 1))
    return obj.map(item => sanitizeObject(item, depth + 1))
  }
  if (obj && typeof obj === 'object') {
    // Bloquer les clés __proto__ et constructor (prototype pollution)
    const sanitized = {}
    for (const [key, value] of Object.entries(obj)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
      sanitized[key] = sanitizeObject(value, depth + 1)
    }
    return sanitized
  }
  return obj
}

/**
 * Middleware: Sanitize XSS sur req.body, req.query et req.params
 */
const xssSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query)
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params)
  }
  next()
}

/**
 * Middleware: Request ID unique pour le tracing
 * Valide le format si fourni par le client (anti-injection dans les logs)
 */
const requestId = (req, res, next) => {
  let id = req.headers['x-request-id']
  // Valider le format: UUID ou alphanumérique max 64 chars
  if (id && (/^[a-zA-Z0-9-]{1,64}$/.test(id))) {
    req.requestId = id
  } else {
    req.requestId = uuidv4()
  }
  res.setHeader('X-Request-ID', req.requestId)
  next()
}

/**
 * Middleware: Headers de sécurité additionnels (au-delà de Helmet)
 */
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')

  // Cross-Origin-Opener-Policy (protection contre les attaques cross-origin)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')

  // Empêcher le cache sur les routes sensibles
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }

  next()
}

/**
 * Middleware: Request Timeout (30 secondes par défaut)
 * Empêche les requêtes qui bloquent indéfiniment le serveur
 */
const requestTimeout = (timeoutMs = 30000) => (req, res, next) => {
  // Exclure les streams vidéo et les uploads
  if (req.path.startsWith('/api/video/') && !req.path.includes('/token/')) {
    return next()
  }
  if (req.path.includes('/upload')) {
    return next()
  }

  const timer = setTimeout(() => {
    if (!res.headersSent) {
      security.warning('REQUEST_TIMEOUT', {
        method: req.method,
        url: req.originalUrl,
      }, req)
      res.status(408).json({
        error: 'Request timeout.',
        code: 'REQUEST_TIMEOUT',
        requestId: req.requestId,
      })
    }
  }, timeoutMs)

  // Cleanup quand la réponse est envoyée
  res.on('finish', () => clearTimeout(timer))
  res.on('close', () => clearTimeout(timer))

  next()
}

/**
 * Middleware: Anti-Enumeration pour les routes d'authentification
 * Ajoute un délai constant pour empêcher le timing attack
 * (savoir si un email existe basé sur le temps de réponse)
 */
const antiEnumeration = (minDelayMs = 200) => async (req, res, next) => {
  const start = Date.now()

  // Override res.json pour ajouter un délai
  const originalJson = res.json.bind(res)
  res.json = function(data) {
    const elapsed = Date.now() - start
    const remaining = Math.max(0, minDelayMs - elapsed)

    if (remaining > 0) {
      setTimeout(() => originalJson(data), remaining)
    } else {
      originalJson(data)
    }
  }

  next()
}

/**
 * Middleware: Bloquer les User-Agents suspects (bots/scanners)
 */
const BLOCKED_USER_AGENTS = [
  'sqlmap', 'nikto', 'nmap', 'dirbuster', 'gobuster',
  'masscan', 'zgrab', 'nuclei', 'httpx', 'burpsuite',
  'havij', 'w3af', 'acunetix', 'nessus', 'openvas',
]

const blockSuspiciousUA = (req, res, next) => {
  const ua = (req.headers['user-agent'] || '').toLowerCase()

  // Bloquer les UA vides en production (bots) — sauf le health check : les
  // sondes d'uptime (UptimeRobot, le healthcheck Docker, curl de monitoring)
  // n'envoient souvent aucun User-Agent, et /api/health ne renvoie rien de
  // sensible. Sans cette exemption, le VPS répondait 403 au monitoring lui-même.
  if (process.env.NODE_ENV === 'production' && !ua && req.path !== '/api/health') {
    security.blocked('EMPTY_USER_AGENT', { ip: req.ip, path: req.path }, req)
    return res.status(403).json({ error: 'Forbidden', code: 'BLOCKED' })
  }

  // Bloquer les scanners connus
  for (const blocked of BLOCKED_USER_AGENTS) {
    if (ua.includes(blocked)) {
      security.blocked('BLOCKED_USER_AGENT', {
        userAgent: ua,
        blockedPattern: blocked,
      }, req)
      return res.status(403).json({ error: 'Forbidden', code: 'BLOCKED' })
    }
  }

  next()
}

/**
 * Middleware: Détection de la langue (i18n)
 * Priorité: 1. Query param ?lang= 2. Header Accept-Language 3. Default "fr"
 */
const SUPPORTED_LOCALES = ['fr', 'en', 'ar']
const DEFAULT_LOCALE = 'fr'

const detectLanguage = (req, res, next) => {
  if (req.query.lang && SUPPORTED_LOCALES.includes(req.query.lang)) {
    req.lang = req.query.lang
    return next()
  }

  const acceptLang = req.headers['accept-language']
  if (acceptLang) {
    const preferred = acceptLang.split(',')
      .map(lang => {
        const [code, qPart] = lang.trim().split(';')
        const q = qPart ? parseFloat(qPart.split('=')[1]) : 1
        return { code: code.split('-')[0].toLowerCase(), q }
      })
      .sort((a, b) => b.q - a.q)

    for (const { code } of preferred) {
      if (SUPPORTED_LOCALES.includes(code)) {
        req.lang = code
        return next()
      }
    }
  }

  req.lang = DEFAULT_LOCALE
  next()
}

/**
 * Middleware: Vérifier la taille du payload JSON par route type
 */
const payloadGuard = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10)

  // Routes d'auth: max 5KB
  if (req.path.startsWith('/api/auth') && contentLength > 5 * 1024) {
    return res.status(413).json({
      error: 'Payload too large for this endpoint.',
      code: 'PAYLOAD_TOO_LARGE',
    })
  }

  // Routes de paiement: max 50KB (sans fichier — le fichier est géré par multer)
  if (req.path.startsWith('/api/payments') && !req.headers['content-type']?.includes('multipart') && contentLength > 50 * 1024) {
    return res.status(413).json({
      error: 'Payload too large for this endpoint.',
      code: 'PAYLOAD_TOO_LARGE',
    })
  }

  next()
}

// ─── CSRF Protection (Double-Submit Cookie) ──────────────────

/**
 * Génère un token CSRF aléatoire
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Middleware: Protection CSRF via double-submit cookie pattern.
 * - Sur GET requests: génère et envoie un token CSRF dans un cookie
 * - Sur POST/PUT/DELETE: vérifie que le header X-CSRF-Token correspond au cookie
 * - Exclut les webhooks (pas de cookie, authentification HMAC propre)
 */
const csrfProtection = (req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production'

  // Exclure les webhooks (authentification HMAC, pas de cookies)
  if (req.path.includes('/webhook')) {
    return next()
  }

  // Exclure les routes non-API (SEO, static files)
  if (!req.path.startsWith('/api/')) {
    return next()
  }

  // Sur les requêtes safe (GET, HEAD, OPTIONS): fournir un token CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.cookies._csrf) {
      const token = generateCsrfToken()
      res.cookie('_csrf', token, {
        httpOnly: false,       // Le frontend doit pouvoir le lire
        secure: isProd,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24h
        path: '/',
      })
    }
    return next()
  }

  // Sur les requêtes mutantes (POST, PUT, DELETE, PATCH):
  // Vérifier que le header X-CSRF-Token correspond au cookie _csrf
  const cookieToken = req.cookies._csrf
  const headerToken = req.headers['x-csrf-token']

  if (!cookieToken || !headerToken) {
    security.blocked('CSRF_VIOLATION', {
      reason: !cookieToken ? 'missing_cookie' : 'missing_header',
    }, req)
    return res.status(403).json({
      error: 'CSRF validation failed.',
      code: 'CSRF_VIOLATION',
    })
  }

  // Timing-safe comparison
  try {
    const cookieBuf = Buffer.from(cookieToken, 'utf8')
    const headerBuf = Buffer.from(headerToken, 'utf8')
    if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
      security.blocked('CSRF_TOKEN_MISMATCH', {}, req)
      return res.status(403).json({
        error: 'CSRF validation failed.',
        code: 'CSRF_VIOLATION',
      })
    }
  } catch (e) {
    security.blocked('CSRF_VALIDATION_ERROR', { error: e.message }, req)
    return res.status(403).json({
      error: 'CSRF validation failed.',
      code: 'CSRF_VIOLATION',
    })
  }

  next()
}

// ─── Path Traversal Guard ────────────────────────────────────

/**
 * Middleware: Détecte et bloque les tentatives de path traversal
 * dans l'URL, les query params et les headers.
 */
const pathTraversalGuard = (req, res, next) => {
  const decodedUrl = decodeURIComponent(req.originalUrl)
  
  // Patterns de path traversal
  const traversalPatterns = [
    /\.\.\//,          // ../
    /\.\.\\/,          // ..\
    /%2e%2e/i,         // URL-encoded ..
    /%252e%252e/i,     // Double URL-encoded ..
    /\.\.%2f/i,        // ..%2f
    /\.\.%5c/i,        // ..%5c
    /%c0%ae/i,         // Unicode overlong encoding of .
    /%c1%9c/i,         // Unicode overlong encoding of /
  ]

  for (const pattern of traversalPatterns) {
    if (pattern.test(decodedUrl) || pattern.test(req.originalUrl)) {
      security.blocked('PATH_TRAVERSAL_ATTEMPT', {
        decodedUrl,
        rawUrl: req.originalUrl,
      }, req)
      return res.status(400).json({
        error: 'Invalid request path.',
        code: 'PATH_TRAVERSAL_BLOCKED',
      })
    }
  }

  next()
}

// ─── NoSQL Injection Guard ───────────────────────────────────

/**
 * Détecte les opérateurs NoSQL ($gt, $ne, $regex, etc.)
 * dans les valeurs du body ou query. Défense en profondeur.
 */
const NOSQL_OPERATORS = ['$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin',
  '$or', '$and', '$not', '$nor', '$exists', '$regex', '$where',
  '$elemMatch', '$expr', '$jsonSchema', '$mod', '$text', '$all']

function containsNoSqlOperator(obj, depth = 0) {
  if (depth > 5) return false
  if (typeof obj === 'string') {
    return NOSQL_OPERATORS.some(op => obj.includes(op))
  }
  if (Array.isArray(obj)) {
    return obj.some(item => containsNoSqlOperator(item, depth + 1))
  }
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (NOSQL_OPERATORS.includes(key)) return true
      if (containsNoSqlOperator(value, depth + 1)) return true
    }
  }
  return false
}

const noSqlInjectionGuard = (req, res, next) => {
  // Check body
  if (req.body && containsNoSqlOperator(req.body)) {
    security.blocked('NOSQL_INJECTION_ATTEMPT', {
      source: 'body',
    }, req)
    return res.status(400).json({
      error: 'Invalid request payload.',
      code: 'INVALID_PAYLOAD',
    })
  }

  // Check query params
  if (req.query && containsNoSqlOperator(req.query)) {
    security.blocked('NOSQL_INJECTION_ATTEMPT', {
      source: 'query',
    }, req)
    return res.status(400).json({
      error: 'Invalid request parameters.',
      code: 'INVALID_PARAMS',
    })
  }

  next()
}

// ─── File Upload Magic Bytes Validator ───────────────────────

/**
 * Magic bytes signatures for common image/video formats.
 * Used for post-upload validation to ensure file content matches declared MIME type.
 */
const MAGIC_BYTES = {
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8, 0xFF]),
  ],
  'image/png': [
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  ],
  'image/gif': [
    Buffer.from('GIF87a'),
    Buffer.from('GIF89a'),
  ],
  'image/webp': [
    // RIFF....WEBP — check bytes 0-3 (RIFF) and 8-11 (WEBP)
    null, // Special case handled in validateFileMagicBytes
  ],
  'video/mp4': [
    // ftyp at offset 4
    null, // Special case
  ],
  'video/webm': [
    Buffer.from([0x1A, 0x45, 0xDF, 0xA3]),
  ],
  'video/ogg': [
    Buffer.from('OggS'),
  ],
}

/**
 * Validates that a file's content matches its declared MIME type using magic bytes.
 * @param {Buffer} fileBuffer - First N bytes of the file
 * @param {string} declaredMimeType - The MIME type declared by the client
 * @returns {boolean} - true if valid, false if mismatch
 */
function validateFileMagicBytes(fileBuffer, declaredMimeType) {
  if (!fileBuffer || fileBuffer.length < 12) return false

  const mimeBase = declaredMimeType?.toLowerCase()

  // Special cases
  if (mimeBase === 'image/webp') {
    const riff = fileBuffer.slice(0, 4).toString('ascii')
    const webp = fileBuffer.slice(8, 12).toString('ascii')
    return riff === 'RIFF' && webp === 'WEBP'
  }

  if (mimeBase === 'video/mp4') {
    // ftyp is at byte offset 4
    const ftyp = fileBuffer.slice(4, 8).toString('ascii')
    return ftyp === 'ftyp'
  }

  // Also accept image/jpg, image/pjpeg, image/x-png as JPEG/PNG
  let lookupMime = mimeBase
  if (['image/jpg', 'image/pjpeg'].includes(mimeBase)) lookupMime = 'image/jpeg'
  if (mimeBase === 'image/x-png') lookupMime = 'image/png'

  const signatures = MAGIC_BYTES[lookupMime]
  if (!signatures) {
    // Unknown MIME type — allow by default (don't block legitimate uploads)
    return true
  }

  for (const sig of signatures) {
    if (sig && fileBuffer.slice(0, sig.length).equals(sig)) {
      return true
    }
  }

  return false
}

/**
 * Express middleware factory: validates uploaded file magic bytes.
 * Use AFTER multer middleware.
 * @param {object} options - { fieldName: string }
 */
function fileTypeValidator(fieldName = 'file') {
  const fs = require('fs')

  return (req, res, next) => {
    const file = req.file
    if (!file) return next() // No file uploaded, skip

    try {
      // Read first 12 bytes of the uploaded file
      const fd = fs.openSync(file.path, 'r')
      const buffer = Buffer.alloc(12)
      fs.readSync(fd, buffer, 0, 12, 0)
      fs.closeSync(fd)

      if (!validateFileMagicBytes(buffer, file.mimetype)) {
        // Delete the suspicious file
        try { fs.unlinkSync(file.path) } catch (_) {}

        security.blocked('FILE_MAGIC_BYTES_MISMATCH', {
          declaredMime: file.mimetype,
          originalName: file.originalname,
          fieldName,
        }, req)

        return res.status(400).json({
          error: 'File content does not match declared type.',
          code: 'INVALID_FILE_TYPE',
        })
      }

      next()
    } catch (err) {
      // On error, let the request proceed (don't block legitimate uploads)
      console.error('File type validation error:', err.message)
      next()
    }
  }
}

// ─── Validation Helpers ──────────────────────────────────────

/**
 * Vérifie qu'un ID est un entier positif valide (anti integer overflow)
 */
function validateId(id) {
  const parsed = parseInt(id, 10)
  return !isNaN(parsed) && parsed > 0 && parsed <= 2147483647 ? parsed : null
}

/**
 * Vérifie que le paymentType est valide (whitelist)
 */
const VALID_PAYMENT_TYPES = ['CCP', 'BARIDIMOB', 'EDAHABIA', 'CIB', 'CHARGILY', 'REDOTPAY', 'STRIPE', 'PAYPAL', 'REFERRAL_REWARD']

function validatePaymentType(type) {
  return VALID_PAYMENT_TYPES.includes(type?.toUpperCase()) ? type.toUpperCase() : null
}

/**
 * Vérifie qu'une string ne dépasse pas une taille maximale
 */
function validateMaxLength(value, maxLen = 500) {
  if (typeof value !== 'string') return false
  return value.length <= maxLen
}

/**
 * Vérifie qu'un email est valide (format strict)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  if (email.length > 254) return false  // RFC 5321 max
  return EMAIL_REGEX.test(email)
}

module.exports = {
  xssSanitizer,
  requestId,
  securityHeaders,
  requestTimeout,
  antiEnumeration,
  blockSuspiciousUA,
  detectLanguage,
  payloadGuard,
  csrfProtection,
  pathTraversalGuard,
  noSqlInjectionGuard,
  fileTypeValidator,
  validateFileMagicBytes,
  validateId,
  validatePaymentType,
  validateMaxLength,
  validateEmail,
  EMAIL_REGEX,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
}
