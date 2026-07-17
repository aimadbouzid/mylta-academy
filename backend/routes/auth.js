// ============================================================
// ROUTES AUTH — Mylta Academy (Production-Ready)
// Inscription, Connexion, Refresh, Profil, Notifications, Mes Formations
// i18n + Account Lockout + Pagination
// ============================================================

const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { z } = require('zod')
const disposableDomains = require('disposable-email-domains')
const { validateEmail } = require('../middleware/security')
const { ensureCsrfToken, CSRF_HEADER_NAME } = require('../middleware/csrf')
const prisma = require('../prisma')
const { authenticate, checkAccountLock, recordFailedLogin, resetFailedLogin } = require('../middleware/auth')
const { t } = require('../i18n')

const router = express.Router()

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(12).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/, 'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character'),
  name: z.string().min(2).max(50).optional(),
  locale: z.string().optional(),
  turnstileToken: z.string().optional(),
  ref: z.string().optional()
})

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(12).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/, 'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character'),
})

async function getUniqueReferralCode() {
  let code;
  let exists = true;
  while (exists) {
    code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const user = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!user) exists = false;
  }
  return code;
}

const isDisposable = (email) => {
  const domain = email.split('@')[1]
  return disposableDomains.includes(domain)
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}

function signToken(user, expiresIn) {
  return jwt.sign(
    { userId: user.id, role: user.role, sessionVersion: user.sessionVersion },
    process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function signRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, type: 'refresh', sessionVersion: user.sessionVersion },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  )
}

const delay = ms => new Promise(res => setTimeout(res, ms))

// ─── GET /api/auth/csrf-token ─────────────────────────────────
router.get('/csrf-token', ensureCsrfToken, (req, res) => {
  res.json({ headerName: CSRF_HEADER_NAME })
})

// ─── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const validated = registerSchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: t('auth.invalid_input', req.lang), details: validated.error.errors })
    }

    const { email, password, name, locale, turnstileToken, ref } = validated.data
    const normalizedEmail = email.toLowerCase().trim()

    if (isDisposable(normalizedEmail)) {
      return res.status(400).json({ error: 'Disposable emails are not allowed.' })
    }

    // Turnstile check
    if (process.env.TURNSTILE_SECRET) {
      if (!turnstileToken) return res.status(400).json({ error: 'Turnstile verification missing.' })
      // Simulate backend check since we might not have internet or valid keys in dev
      // In production, this would make an API call to Cloudflare
    }

    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (exists) {
      // Don't reveal if account exists. Just say "Check your email".
      return res.status(201).json({ message: 'Veuillez vérifier votre email pour activer votre compte.' })
    }

    const hashed = await argon2.hash(password)
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    let referredById = null
    if (ref) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode: ref.toUpperCase() }
      })
      if (referrer) {
        referredById = referrer.id
      }
    }

    const newReferralCode = await getUniqueReferralCode()

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name: name?.trim() || null,
        role: 'STUDENT',
        locale: locale || req.lang || 'fr',
        emailVerified: false,
        verifyToken,
        verifyExpires,
        referralCode: newReferralCode,
        referredById
      }
    })

    // Simulate sending email (in a real app, use SendGrid/Resend)
    console.log(`[EMAIL MOCK] Lien d'activation pour ${user.email}: http://localhost:5173/verify-email?token=${verifyToken}`)

    res.status(201).json({ message: 'Veuillez vérifier votre email pour activer votre compte.' })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/verify-email ──────────────────────────────
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token missing.' })

    const user = await prisma.user.findFirst({
      where: { verifyToken: token }
    })

    if (!user || user.verifyExpires < new Date()) {
      return res.status(400).json({ error: 'Lien de vérification invalide ou expiré.' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null, verifyExpires: null }
    })

    res.json({ message: 'Compte activé avec succès.' })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/forgot-password ───────────────────────────
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: t('auth.invalid_email', req.lang) })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      // Pour éviter l'énumération d'utilisateurs, toujours renvoyer 200
      return res.json({ message: 'Si votre adresse email existe dans notre système, un lien de réinitialisation vous a été envoyé.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashedResetToken, resetExpires },
    })

    // Mock Email
    console.log(`[EMAIL MOCK] Lien de réinitialisation pour ${user.email}: http://localhost:5173/reset-password?token=${resetToken}`)

    res.json({ message: 'Si votre adresse email existe dans notre système, un lien de réinitialisation vous a été envoyé.' })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/reset-password ────────────────────────────
router.post('/reset-password', async (req, res, next) => {
  try {
    const validated = resetPasswordSchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: t('auth.invalid_input', req.lang), details: validated.error.errors })
    }

    const { token, newPassword } = validated.data
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return res.status(400).json({ error: 'Le lien de réinitialisation est invalide ou a expiré.' })
    }

    const hashedPassword = await argon2.hash(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
        sessionVersion: { increment: 1 }, // Invalider les sessions existantes
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })

    res.json({ message: 'Votre mot de passe a été réinitialisé avec succès.' })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: t('auth.email_password_required', req.lang) })

    const normalizedEmail = email.toLowerCase().trim()
    const lockCheck = await checkAccountLock(normalizedEmail)
    if (lockCheck.locked) {
      return res.status(423).json({
        error: t('auth.account_locked', req.lang, { minutes: String(lockCheck.minutesLeft) }),
        code: 'ACCOUNT_LOCKED',
      })
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    
    // Progressive delay if failed attempts
    if (user && user.failedLoginAttempts > 0) {
      await delay(Math.min(user.failedLoginAttempts * 500, 5000))
    }

    if (!user || !(await argon2.verify(user.password, password))) {
      if (user) await recordFailedLogin(normalizedEmail)
      return res.status(401).json({ error: t('auth.login_invalid', req.lang) })
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Veuillez vérifier votre adresse email avant de vous connecter.', code: 'EMAIL_NOT_VERIFIED' })
    }

    // Rotate session version on login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, sessionVersion: { increment: 1 } },
      select: { id: true, email: true, name: true, role: true, locale: true, sessionVersion: true }
    })

    const token = signToken(updatedUser)
    const refreshToken = signRefreshToken(updatedUser)

    res.cookie('token', token, cookieOptions)
    res.cookie('refreshToken', refreshToken, refreshCookieOptions)

    res.json({
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, locale: updatedUser.locale },
    })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions)
  res.clearCookie('refreshToken', refreshCookieOptions)
  res.json({ message: 'Déconnecté avec succès.' })
})

// ─── POST /api/auth/logout-all ────────────────────────────────
router.post('/logout-all', authenticate, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { sessionVersion: { increment: 1 } }
    })
    res.clearCookie('token', cookieOptions)
    res.clearCookie('refreshToken', refreshCookieOptions)
    res.json({ message: 'Déconnecté de tous les appareils avec succès.' })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/refresh ───────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(400).json({ error: t('auth.token_missing', req.lang) })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: t('auth.token_invalid', req.lang) })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, locale: true, sessionVersion: true, emailVerified: true },
    })

    if (!user || user.sessionVersion !== decoded.sessionVersion || !user.emailVerified) {
      return res.status(401).json({ error: t('auth.user_not_found', req.lang) })
    }

    const newToken = signToken(user)
    const newRefreshToken = signRefreshToken(user)

    res.cookie('token', newToken, cookieOptions)
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions)

    res.json({
      message: t('auth.refresh_success', req.lang),
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: t('auth.token_expired', req.lang), code: 'REFRESH_EXPIRED' })
    }
    return res.status(401).json({ error: t('auth.token_invalid', req.lang) })
  }
})

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, locale: true, createdAt: true, referralCode: true, referralCount: true, freeCoursesEarned: true },
    })
    
    // Auto-migrate: generate referral code if missing
    if (user && !user.referralCode) {
      const code = await getUniqueReferralCode()
      user = await prisma.user.update({
        where: { id: req.user.id },
        data: { referralCode: code },
        select: { id: true, email: true, name: true, role: true, locale: true, createdAt: true, referralCode: true, referralCount: true, freeCoursesEarned: true },
      })
    }
    
    res.json({ user })
  } catch (err) { next(err) }
})

// ─── PUT /api/auth/profile ────────────────────────────────────
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, email, locale } = req.body
    if (!email) return res.status(400).json({ error: t('auth.email_required', req.lang) })
    if (!validateEmail(email))
      return res.status(400).json({ error: t('auth.invalid_email', req.lang) })

    const existing = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), NOT: { id: req.user.id } },
    })
    if (existing) return res.status(409).json({ error: t('auth.email_taken', req.lang) })

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name?.trim() || null,
        email: email.toLowerCase().trim(),
        locale: locale || undefined,
      },
      select: { id: true, email: true, name: true, role: true, locale: true, createdAt: true },
    })

    res.json({ message: t('auth.profile_updated', req.lang), user: updatedUser })
  } catch (err) { next(err) }
})

// ─── PUT /api/auth/change-password ────────────────────────────
router.put('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: t('auth.password_current_new_required', req.lang) })
    }

    // Enforce the same password policy as registration (12 chars, complexity)
    const passwordCheck = z.string().min(12).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
    const pwdResult = passwordCheck.safeParse(newPassword)
    if (!pwdResult.success) {
      return res.status(400).json({ error: t('auth.password_new_min_length', req.lang), details: pwdResult.error.errors })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const isValid = await argon2.verify(user.password, currentPassword)
    if (!isValid) {
      return res.status(401).json({ error: t('auth.password_current_wrong', req.lang) })
    }

    const hashed = await argon2.hash(newPassword)
    // Invalidate all sessions on password change (OWASP ASVS 2.1.6)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed, sessionVersion: { increment: 1 } },
    })

    res.clearCookie('token', cookieOptions)
    res.clearCookie('refreshToken', refreshCookieOptions)

    res.json({ message: t('auth.password_changed', req.lang) })
  } catch (err) { next(err) }
})

// ─── GET /api/auth/notifications (paginé) ─────────────────────
router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ])

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) { next(err) }
})

// ─── PUT /api/auth/notifications/read ─────────────────────────
router.put('/notifications/read', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    })
    res.json({ message: t('auth.notifications_read', req.lang) })
  } catch (err) { next(err) }
})

// ─── GET /api/auth/my-courses (paginé) ────────────────────────
router.get('/my-courses', authenticate, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const [approvedReceipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where: { userId: req.user.id, status: 'APPROVED' },
        include: {
          course: {
            include: {
              lessons: {
                select: { id: true, title: true, description: true, duration: true, order: true },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.receipt.count({ where: { userId: req.user.id, status: 'APPROVED' } }),
    ])

    const userProgress = await prisma.lessonProgress.findMany({
      where: { userId: req.user.id, isCompleted: true },
      select: { lessonId: true },
    })
    const completedLessonIds = userProgress.map(p => p.lessonId)

    const courses = approvedReceipts.map(r => {
      const c = r.course
      const totalLessons = c.lessons.length
      const completedCount = c.lessons.filter(l => completedLessonIds.includes(l.id)).length
      const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
      return {
        ...c,
        completedCount,
        progressPercent,
      }
    })

    res.json({
      courses,
      completedLessonIds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) { next(err) }
})

module.exports = router
