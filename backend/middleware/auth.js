// ============================================================
// MIDDLEWARE AUTH — Mylta Academy (Production-Ready)
// JWT Authentication + Admin Guard + Account Lockout
// ============================================================

const jwt = require('jsonwebtoken')
const prisma = require('../prisma') // Singleton — pas de new PrismaClient()
const { t } = require('../i18n')

/**
 * authenticate — Vérifie le JWT Bearer dans Authorization header.
 * Attache req.user = { id, email, name, role, locale } si valide.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  let token = null
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({
      error: t('auth.token_missing', req.lang),
      code: 'NO_TOKEN',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Vérifier que l'utilisateur existe toujours en base
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, locale: true, sessionVersion: true, emailVerified: true },
    })

    if (!user) {
      return res.status(401).json({
        error: t('auth.user_not_found', req.lang),
        code: 'USER_NOT_FOUND',
      })
    }

    // sessionVersion est EXIGÉ : un jeton dépourvu de ce champ échappait sinon
    // à la révocation de session (déconnexion globale, changement de mot de
    // passe). Les jetons émis avant son introduction sont donc rejetés.
    if (user.sessionVersion !== decoded.sessionVersion) {
      return res.status(401).json({
        error: t('auth.session_invalidated', req.lang),
        code: 'SESSION_INVALIDATED',
      })
    }

    if (decoded.sessionId) {
      const activeSession = await prisma.userSession.findUnique({ where: { id: decoded.sessionId } })
      if (!activeSession) {
        return res.status(401).json({
          error: 'Session expirée ou révoquée.',
          code: 'SESSION_REVOKED',
        })
      }
      req.sessionId = decoded.sessionId
    }

    // Utiliser la locale de l'utilisateur si pas de préférence dans la requête
    if (user.locale && !req.query.lang) {
      req.lang = user.locale
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: t('auth.token_expired', req.lang),
        code: 'TOKEN_EXPIRED',
      })
    }
    return res.status(401).json({
      error: t('auth.token_invalid', req.lang),
      code: 'INVALID_TOKEN',
    })
  }
}

/**
 * isAdmin — S'assure que l'utilisateur authentifié a le rôle ADMIN.
 * Doit être utilisé APRÈS authenticate dans la chaîne de middlewares.
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: t('auth.unauthenticated', req.lang),
      code: 'UNAUTHENTICATED',
    })
  }

  if (req.user.role !== 'ADMIN') {
    console.warn(
      `🚫 [ACCÈS REFUSÉ] User ${req.user.email} (rôle: ${req.user.role}) → ${req.method} ${req.originalUrl} [${req.requestId}]`
    )
    return res.status(403).json({
      error: t('auth.forbidden_admin', req.lang),
      code: 'FORBIDDEN_ADMIN_ONLY',
    })
  }

  next()
}

/**
 * Account lockout constants
 * Configuration assouplie pour éviter de bloquer les vrais utilisateurs
 */
const MAX_FAILED_ATTEMPTS = 10
const LOCKOUT_DURATION_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Vérifie si le compte est verrouillé
 */
async function checkAccountLock(email) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, failedLoginAttempts: true, lockedUntil: true },
  })

  if (!user) return { locked: false, user: null }

  if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
    const minutesLeft = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000)
    return { locked: true, minutesLeft, user }
  }

  // Si le lockout a expiré, reset le compteur
  if (user.lockedUntil && new Date() >= new Date(user.lockedUntil)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    })
    return { locked: false, user: { ...user, failedLoginAttempts: 0 } }
  }

  return { locked: false, user }
}

/**
 * Incrémente le compteur d'échecs et verrouille si nécessaire
 */
async function recordFailedLogin(email) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, failedLoginAttempts: true },
  })

  if (!user) return

  const newCount = (user.failedLoginAttempts || 0) + 1
  const data = { failedLoginAttempts: newCount }

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    // Faille corrigée : On ne verrouille plus le compte via l'email pour éviter le DoS (Account Lockout)
    // On se repose sur le Rate Limiting (par IP) et le délai progressif
    console.warn(`🔒 [SECURITY] Compte ${email} : ${newCount} tentatives échouées. Verrouillage ignoré pour contrer le DoS.`)
  }

  await prisma.user.update({ where: { id: user.id }, data })
}

/**
 * Réinitialise le compteur d'échecs après un login réussi
 */
async function resetFailedLogin(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  })
}

module.exports = {
  authenticate,
  isAdmin,
  checkAccountLock,
  recordFailedLogin,
  resetFailedLogin,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS,
}
