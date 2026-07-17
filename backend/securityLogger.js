// ============================================================
// SECURITY LOGGER — Mylta Academy (Production-Ready)
// Centralized structured security event logging
// Automatic sensitive data redaction + Request ID correlation
// ============================================================

const SENSITIVE_KEYS = [
  'password', 'currentPassword', 'newPassword', 'token', 'refreshToken',
  'jwt', 'secret', 'authorization', 'cookie', 'set-cookie',
  'x-csrf-token', 'signature', 'verifyToken', 'creditCard',
  'cardNumber', 'cvv', 'ssn',
]

/**
 * Redact sensitive values from an object (shallow)
 * Does NOT log any real values for sensitive fields.
 */
function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const redacted = {}
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      redacted[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redact(value)
    } else {
      redacted[key] = value
    }
  }
  return redacted
}

/**
 * Log a structured security event.
 *
 * @param {'EVENT'|'WARNING'|'ALERT'|'BLOCKED'} level - Severity
 * @param {string} event - Event identifier (e.g. 'CSRF_VIOLATION', 'BRUTE_FORCE_DETECTED')
 * @param {object} details - Additional context (req info, user, etc.)
 * @param {object} [req] - Express request object (optional, extracts common fields)
 */
function securityLog(level, event, details = {}, req = null) {
  const entry = {
    level: `SECURITY_${level}`,
    event,
    timestamp: new Date().toISOString(),
  }

  // Extract common request info if available
  if (req) {
    entry.requestId = req.requestId || undefined
    entry.ip = req.ip || undefined
    entry.method = req.method || undefined
    entry.url = req.originalUrl || undefined
    entry.userAgent = req.headers?.['user-agent'] || undefined
    entry.userId = req.user?.id || undefined
  }

  // Merge redacted details
  Object.assign(entry, redact(details))

  // Remove undefined values for clean output
  for (const key of Object.keys(entry)) {
    if (entry[key] === undefined) delete entry[key]
  }

  // Route to appropriate console method
  switch (level) {
    case 'ALERT':
    case 'BLOCKED':
      console.error(JSON.stringify(entry))
      break
    case 'WARNING':
      console.warn(JSON.stringify(entry))
      break
    default:
      console.log(JSON.stringify(entry))
  }

  return entry
}

// Convenience helpers
const security = {
  event: (event, details, req) => securityLog('EVENT', event, details, req),
  warning: (event, details, req) => securityLog('WARNING', event, details, req),
  alert: (event, details, req) => securityLog('ALERT', event, details, req),
  blocked: (event, details, req) => securityLog('BLOCKED', event, details, req),
}

module.exports = { securityLog, security, redact }
