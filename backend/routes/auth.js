// ============================================================
// ROUTES AUTH — Mylta Academy (Production-Ready)
// Inscription, Connexion, Refresh, Profil, Notifications, Mes Formations
// i18n + Account Lockout + Pagination
// ============================================================

const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const axios = require('axios')
const { z } = require('zod')
const disposableDomains = require('disposable-email-domains')
const { validateEmail } = require('../middleware/security')
const { ensureCsrfToken, CSRF_HEADER_NAME } = require('../middleware/csrf')
const prisma = require('../prisma')
const { phoneToEmail } = require('../utils/phoneAccount')
const { authenticate, checkAccountLock, recordFailedLogin, resetFailedLogin } = require('../middleware/auth')
const { t } = require('../i18n')
const { sendResetPasswordEmail, sendVerificationEmail, isMailerConfigured } = require('../utils/mailer')
const { OAuth2Client } = require('google-auth-library')
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const router = express.Router()

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(100).regex(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/, 'Le mot de passe doit contenir au moins 8 caractères, 1 lettre et 1 chiffre'),
  name: z.string().min(2).max(50).optional(),
  locale: z.string().optional(),
  turnstileToken: z.string().optional(),
  ref: z.string().optional()
})

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).max(100).regex(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/, 'Le mot de passe doit contenir au moins 8 caractères, 1 lettre et 1 chiffre'),
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

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000 // Durée de validité d'un lien d'activation
const RESEND_COOLDOWN_MS = 60 * 1000

// Génère un nouveau token d'activation, l'enregistre, puis tente l'envoi.
// mailSent === false quand SMTP est absent ou que l'envoi a échoué : l'appelant
// doit alors éviter de laisser l'utilisateur attendre un email qui n'arrivera pas.
async function issueVerificationEmail(user) {
  const verifyToken = crypto.randomBytes(32).toString('hex')
  const verifyExpires = new Date(Date.now() + VERIFY_TTL_MS)
  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken, verifyExpires }
  })

  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verifyToken}`
  let mailSent = false
  try {
    mailSent = await sendVerificationEmail(user.email, verifyUrl)
  } catch (err) {
    console.error(`[EMAIL] Échec de l'envoi de l'activation à ${user.email} :`, err.message)
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[EMAIL] Lien d'activation pour ${user.email} : ${verifyUrl}`)
  }
  return { verifyUrl, mailSent }
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

function signToken(user, sessionId, expiresIn) {
  return jwt.sign(
    { userId: user.id, role: user.role, sessionVersion: user.sessionVersion, sessionId },
    process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function signRefreshToken(user, sessionId) {
  return jwt.sign(
    { userId: user.id, type: 'refresh', sessionVersion: user.sessionVersion, sessionId },
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
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET,
          response: turnstileToken,
          remoteip: req.ip,
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return res.status(400).json({ error: 'Turnstile verification failed.' })
      }
    }

    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (exists) {
      // Don't reveal if account exists. Just say "Check your email".
      return res.status(201).json({ message: 'Veuillez vérifier votre email pour activer votre compte.' })
    }

    const hashed = await argon2.hash(password)

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
        referralCode: newReferralCode,
        referredById
      }
    })

    const { mailSent } = await issueVerificationEmail(user)

    // Sans SMTP configuré, aucun lien d'activation ne partira jamais et le compte
    // resterait bloqué au login : on l'active directement. Dès que SMTP_USER /
    // SMTP_PASS sont renseignés, la vérification par email reprend d'elle-même.
    if (!mailSent && !isMailerConfigured()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, verifyToken: null, verifyExpires: null }
      })
      console.warn(`[EMAIL] SMTP non configuré — compte ${user.email} activé sans vérification.`)
      return res.status(201).json({
        message: 'Compte créé ! Vous pouvez vous connecter.',
        autoVerified: true
      })
    }

    if (!mailSent) {
      console.error(`[EMAIL] Compte ${user.email} créé mais email d'activation non envoyé — il devra être redemandé via /auth/resend-verification.`)
    }

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

// ─── POST /api/auth/resend-verification ───────────────────────
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: t('auth.invalid_email', req.lang) })
    }

    // Réponse volontairement identique dans tous les cas : ne pas révéler
    // quels emails existent ni lesquels sont déjà activés.
    const genericResponse = {
      message: 'Si un compte non activé existe pour cette adresse, un nouveau lien vient d\'être envoyé.'
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user || user.emailVerified) return res.json(genericResponse)

    // Anti-spam : la date du dernier envoi se déduit de l'expiration du token.
    if (user.verifyExpires) {
      const lastSentAt = user.verifyExpires.getTime() - VERIFY_TTL_MS
      if (Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
        const retryAfter = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - lastSentAt)) / 1000)
        return res.status(429).json({
          error: `Merci de patienter ${retryAfter} s avant de redemander un lien.`,
          code: 'RESEND_COOLDOWN',
          retryAfterSeconds: retryAfter
        })
      }
    }

    const { mailSent } = await issueVerificationEmail(user)

    // Même logique qu'à l'inscription : sans SMTP, on débloque le compte.
    if (!mailSent && !isMailerConfigured()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, verifyToken: null, verifyExpires: null }
      })
      console.warn(`[EMAIL] SMTP non configuré — compte ${user.email} activé sans vérification.`)
      return res.json({
        message: 'Compte activé. Vous pouvez vous connecter.',
        autoVerified: true
      })
    }

    res.json(genericResponse)
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

    // Envoi de l'email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
    await sendResetPasswordEmail(user.email, resetUrl)
    console.log(`[EMAIL ENVOYÉ] Lien de réinitialisation pour ${user.email}: ${resetUrl}`)

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
        sessionVersion: { increment: 1 }, // Invalider les anciennes sessions
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })
    
    // Supprimer toutes les sessions actives (UserSession)
    await prisma.userSession.deleteMany({ where: { userId: user.id } })

    res.json({ message: 'Votre mot de passe a été réinitialisé avec succès.' })
  } catch (err) { next(err) }
})



// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: t('auth.email_password_required', req.lang) })

    // Les participants du présentiel se connectent avec leur numéro de téléphone.
    const normalizedEmail = email.includes('@') ? email.toLowerCase().trim() : phoneToEmail(email)
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

    if (!user || !user.password || !(await argon2.verify(user.password, password))) {
      if (user) await recordFailedLogin(normalizedEmail)
      return res.status(401).json({ error: t('auth.login_invalid', req.lang) })
    }

    if (!user.emailVerified) {
      // Sans SMTP, aucun lien d'activation n'a pu partir : un compte créé dans
      // ces conditions ne doit pas rester bloqué. Le mot de passe vient d'être vérifié.
      if (!isMailerConfigured()) {
        await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, verifyToken: null, verifyExpires: null } })
      } else {
        return res.status(403).json({ error: 'Veuillez vérifier votre adresse email avant de vous connecter.', code: 'EMAIL_NOT_VERIFIED' })
      }
    }

    // Rotate session version on login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, sessionVersion: { increment: 1 } },
      select: { id: true, email: true, name: true, role: true, locale: true, sessionVersion: true }
    })

    // Gérer les sessions (Max 3)
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const sessionCount = await prisma.userSession.count({ where: { userId: updatedUser.id } })
    if (sessionCount >= 3) {
      const oldestSession = await prisma.userSession.findFirst({
        where: { userId: updatedUser.id },
        orderBy: { lastSeen: 'asc' }
      })
      if (oldestSession) await prisma.userSession.delete({ where: { id: oldestSession.id } })
    }
    const userSession = await prisma.userSession.create({
      data: { userId: updatedUser.id, ip, userAgent }
    })

    const token = signToken(updatedUser, userSession.id)
    const refreshToken = signRefreshToken(updatedUser, userSession.id)

    res.cookie('token', token, cookieOptions)
    res.cookie('refreshToken', refreshToken, refreshCookieOptions)

    res.json({
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, locale: updatedUser.locale },
    })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/google ────────────────────────────────────
router.post('/google', async (req, res, next) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token Google manquant.' })

    let ticket;
    try {
      console.log('Verifying with audience:', process.env.GOOGLE_CLIENT_ID)
      ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
    } catch (err) {
      console.error('Google Auth Verify Error:', err.message)
      return res.status(401).json({ error: t('auth.token_invalid', req.lang) || 'Token Google invalide.' })
    }

    const payload = ticket.getPayload()
    const email = payload.email.toLowerCase().trim()
    const googleId = payload.sub
    const name = payload.name

    if (payload.email_verified === false) {
      return res.status(403).json({ error: 'L\'adresse email Google n\'est pas vérifiée.', code: 'EMAIL_NOT_VERIFIED' })
    }

    const lockCheck = await checkAccountLock(email)
    if (lockCheck.locked) {
      return res.status(423).json({
        error: t('auth.account_locked', req.lang, { minutes: String(lockCheck.minutesLeft) }),
        code: 'ACCOUNT_LOCKED',
      })
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    })

    if (user) {
      // S'il existe par email mais n'a pas de googleId, on lie le compte
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, authProvider: 'GOOGLE' }
        })
      }
    } else {
      // Création de l'utilisateur
      const newReferralCode = await getUniqueReferralCode()
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name: name || null,
          role: 'STUDENT',
          locale: req.lang || 'fr',
          emailVerified: true, // Google vérifie l'email
          authProvider: 'GOOGLE',
          referralCode: newReferralCode
        }
      })
    }

    // Connexion
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, sessionVersion: { increment: 1 } },
      select: { id: true, email: true, name: true, role: true, locale: true, sessionVersion: true }
    })

    // Gérer les sessions (Max 3)
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const sessionCount = await prisma.userSession.count({ where: { userId: updatedUser.id } })
    if (sessionCount >= 3) {
      const oldestSession = await prisma.userSession.findFirst({
        where: { userId: updatedUser.id },
        orderBy: { lastSeen: 'asc' }
      })
      if (oldestSession) await prisma.userSession.delete({ where: { id: oldestSession.id } })
    }
    const userSession = await prisma.userSession.create({
      data: { userId: updatedUser.id, ip, userAgent }
    })

    const jwtToken = signToken(updatedUser, userSession.id)
    const refreshToken = signRefreshToken(updatedUser, userSession.id)

    res.cookie('token', jwtToken, cookieOptions)
    res.cookie('refreshToken', refreshToken, refreshCookieOptions)

    res.json({
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, locale: updatedUser.locale },
    })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/facebook ───────────────────────────────────
// Flow: frontend obtient un accessToken via le SDK JS Facebook (FB.login) →
//       l'envoie ici → on le vérifie via debug_token (confirme qu'il a été
//       émis pour CETTE app, pas rejoué depuis une autre) → on lit le
//       profil (id, name, email) via /me → find/create user → JWT.
//
// Variables d'environnement requises :
//   FACEBOOK_APP_ID
//   FACEBOOK_APP_SECRET
router.post('/facebook', async (req, res, next) => {
  try {
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      return res.status(503).json({ error: 'Connexion Facebook non configurée.' })
    }

    const { accessToken } = req.body
    if (!accessToken) return res.status(400).json({ error: 'Token Facebook manquant.' })

    let fbProfile
    try {
      // debug_token confirme que le token est valide et a été émis pour cette
      // app précise — sans ça, un accessToken Facebook obtenu pour une autre
      // application pourrait être rejoué ici pour usurper un compte.
      const { data: debug } = await axios.get('https://graph.facebook.com/debug_token', {
        params: {
          input_token: accessToken,
          access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`,
        },
      })
      if (!debug?.data?.is_valid || String(debug.data.app_id) !== String(FACEBOOK_APP_ID)) {
        throw new Error('Token Facebook invalide ou émis pour une autre application.')
      }

      const { data: profile } = await axios.get('https://graph.facebook.com/me', {
        params: { fields: 'id,name,email', access_token: accessToken },
      })
      fbProfile = profile
    } catch (err) {
      console.error('Facebook Auth Verify Error:', err.response?.data || err.message)
      return res.status(401).json({ error: t('auth.token_invalid', req.lang) || 'Token Facebook invalide.' })
    }

    const email = fbProfile.email?.toLowerCase().trim()
    const facebookId = fbProfile.id
    const name = fbProfile.name

    // Facebook n'inclut le champ email dans /me que s'il est confirmé sur le
    // compte. Un utilisateur ayant refusé la permission "email" (ou dont le
    // compte Facebook n'en a pas) ne peut pas être rattaché à notre modèle
    // User, qui exige un email unique.
    if (!email) {
      return res.status(400).json({
        error: "Facebook n'a pas fourni d'adresse email. Autorisez l'accès à l'email ou utilisez un autre mode de connexion.",
      })
    }

    const lockCheck = await checkAccountLock(email)
    if (lockCheck.locked) {
      return res.status(423).json({
        error: t('auth.account_locked', req.lang, { minutes: String(lockCheck.minutesLeft) }),
        code: 'ACCOUNT_LOCKED',
      })
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { facebookId },
          { email },
        ],
      },
    })

    if (user) {
      // S'il existe par email mais n'a pas de facebookId, on lie le compte
      if (!user.facebookId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { facebookId, authProvider: 'FACEBOOK' },
        })
      }
    } else {
      // Création de l'utilisateur
      const newReferralCode = await getUniqueReferralCode()
      user = await prisma.user.create({
        data: {
          email,
          facebookId,
          name: name || null,
          role: 'STUDENT',
          locale: req.lang || 'fr',
          emailVerified: true, // Facebook ne renvoie l'email que s'il est vérifié
          authProvider: 'FACEBOOK',
          referralCode: newReferralCode,
        },
      })
    }

    // Connexion
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, sessionVersion: { increment: 1 } },
      select: { id: true, email: true, name: true, role: true, locale: true, sessionVersion: true },
    })

    // Gérer les sessions (Max 3)
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const sessionCount = await prisma.userSession.count({ where: { userId: updatedUser.id } })
    if (sessionCount >= 3) {
      const oldestSession = await prisma.userSession.findFirst({
        where: { userId: updatedUser.id },
        orderBy: { lastSeen: 'asc' },
      })
      if (oldestSession) await prisma.userSession.delete({ where: { id: oldestSession.id } })
    }
    const userSession = await prisma.userSession.create({
      data: { userId: updatedUser.id, ip, userAgent },
    })

    const jwtToken = signToken(updatedUser, userSession.id)
    const refreshToken = signRefreshToken(updatedUser, userSession.id)

    res.cookie('token', jwtToken, cookieOptions)
    res.cookie('refreshToken', refreshToken, refreshCookieOptions)

    res.json({
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, locale: updatedUser.locale },
    })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    if (req.user && req.sessionId) {
      await prisma.userSession.deleteMany({ where: { id: req.sessionId } })
    }
    res.clearCookie('token', cookieOptions)
    res.clearCookie('refreshToken', refreshCookieOptions)
    res.json({ message: 'Déconnecté avec succès.' })
  } catch (err) { next(err) }
})

// ─── POST /api/auth/logout-all ────────────────────────────────
router.post('/logout-all', authenticate, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { sessionVersion: { increment: 1 } }
    })
    await prisma.userSession.deleteMany({ where: { userId: req.user.id } })
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

    if (decoded.sessionId) {
      const session = await prisma.userSession.findUnique({ where: { id: decoded.sessionId } })
      if (!session) return res.status(401).json({ error: 'Session révoquée.', code: 'SESSION_REVOKED' })
      await prisma.userSession.update({ where: { id: decoded.sessionId }, data: { lastSeen: new Date() } })
    }

    const newToken = signToken(user, decoded.sessionId)
    const newRefreshToken = signRefreshToken(user, decoded.sessionId)

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
    const { name, locale } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name?.trim() || null,
        locale: locale || undefined,
      },
      select: { id: true, email: true, name: true, role: true, locale: true, createdAt: true, emailVerified: true },
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

    // Enforce the same password policy as registration (6 chars, letter + number)
    const passwordCheck = z.string().min(8).max(100).regex(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
    const pwdResult = passwordCheck.safeParse(newPassword)
    if (!pwdResult.success) {
      return res.status(400).json({ error: t('auth.password_new_min_length', req.lang), details: pwdResult.error.errors })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    
    if (!user.password) {
      return res.status(400).json({ error: 'Votre compte est lié à Google ou Facebook (aucun mot de passe défini). Veuillez utiliser la réinitialisation de mot de passe.' })
    }

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
    await prisma.userSession.deleteMany({ where: { userId: req.user.id } })

    res.clearCookie('token', cookieOptions)
    res.clearCookie('refreshToken', refreshCookieOptions)

    res.json({ message: t('auth.password_changed', req.lang) })
  } catch (err) { next(err) }
})

// ─── GET /api/auth/export-data ────────────────────────────
router.get('/export-data', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        receipts: true,
        lessonProgress: true,
        reviews: true,
      }
    })
    
    // Remove sensitive info
    const exportData = {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      receipts: user.receipts,
      progress: user.lessonProgress,
      reviews: user.reviews
    }
    
    res.json(exportData)
  } catch (err) { next(err) }
})

// ─── DELETE /api/auth/delete-account ────────────────────────────
router.delete('/delete-account', authenticate, async (req, res, next) => {
  try {
    // Anonymize the user to preserve receipt references
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const anonymizedEmail = `deleted_user_${req.user.id}_${randomSuffix}@myacademy.com`;
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        email: anonymizedEmail,
        name: 'Utilisateur Supprimé',
        password: null,
        googleId: null,
        facebookId: null,
        sessionVersion: { increment: 1 }
      }
    });
    
    await prisma.userSession.deleteMany({ where: { userId: req.user.id } });
    await prisma.lessonProgress.deleteMany({ where: { userId: req.user.id } });
    await prisma.notification.deleteMany({ where: { userId: req.user.id } });
    
    res.clearCookie('token', cookieOptions)
    res.clearCookie('refreshToken', refreshCookieOptions)
    
    res.json({ message: "Votre compte a été supprimé avec succès." })
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

// ─── INSCRIPTION NEWSLETTER (Sécurisée & Hardened) ────────────
const newsletterSchema = z.object({
  email: z.string().email('Adresse email invalide').max(100, 'Email trop long').toLowerCase().trim(),
})

router.post('/newsletter/subscribe', async (req, res, next) => {
  try {
    const parseResult = newsletterSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: parseResult.error.errors[0]?.message || 'Adresse email invalide', 
        code: 'INVALID_EMAIL' 
      })
    }

    const { email } = parseResult.data

    if (isDisposable(email)) {
      return res.status(400).json({ 
        error: 'Les adresses emails jetables ne sont pas autorisées.', 
        code: 'DISPOSABLE_EMAIL' 
      })
    }

    // Upsert dans la base de données Prisma pour éviter les doublons ou crashs
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: {
        email,
        source: 'resources_page',
      },
    })

    return res.json({ 
      success: true, 
      message: 'Inscription enregistrée avec succès' 
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
