// ============================================================  
// SERVER.JS — Mylta Academy API (Production-Ready, Hardened)
// Scalable, Secure, Internationalized
// ============================================================

require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const hpp        = require('hpp')
const compression = require('compression')
const path       = require('path')
const fs         = require('fs')
const rateLimit  = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const jwt        = require('jsonwebtoken')
const prisma     = require('./prisma')
const { initSocket } = require('./socket')
const { initCron } = require('./cron/cleanupReceipts')

const { httpLogger, errorHandler } = require('./middleware/errorHandler')
const {
  xssSanitizer, requestId, securityHeaders, detectLanguage,
  requestTimeout, blockSuspiciousUA, payloadGuard, antiEnumeration,
} = require('./middleware/security')
const { ensureCsrfToken, validateCsrf } = require('./middleware/csrf')
const { t } = require('./i18n')

const authRoutes    = require('./routes/auth')
const courseRoutes  = require('./routes/courses')
const videoRoutes   = require('./routes/video')
const paymentRoutes = require('./routes/payments')
const adminRoutes   = require('./routes/admin')
const seoRoutes     = require('./routes/seo')
const instructorRoutes = require('./routes/instructor')
const coachingRoutes = require('./routes/coaching')
const inPersonRoutes = require('./routes/inPerson')
const contestRoutes = require('./routes/contest')

// ─── App & Config ─────────────────────────────────────────────
const app    = express()
const PORT   = parseInt(process.env.PORT || '3000', 10)
const isProd = process.env.NODE_ENV === 'production'

// ─── Vérification JWT secret au démarrage (production) ────────
const WEAK_SECRETS = [
  'myltaacademy_jwt_secret_changez_moi_en_production_2024_DZD',
  'secret', 'changeme', 'jwt_secret', 'your-secret-here',
]
if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || WEAK_SECRETS.includes(process.env.JWT_SECRET))) {
  console.error('\x1b[31m❌ FATAL: JWT_SECRET est trop faible ou absent pour la production.\x1b[0m')
  console.error('   Générez un secret fort: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"')
  process.exit(1)
}

// ─── Créer les dossiers nécessaires ───────────────────────────
const uploadDir = path.join(__dirname, 'uploads', 'receipts')
const introDir  = path.join(__dirname, 'uploads', 'intro')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
if (!fs.existsSync(introDir))  fs.mkdirSync(introDir, { recursive: true })

// ─── Rate Limiters (tiered by sensitivity) ───────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: t('errors.rate_limited', 'fr'), code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // IP-based
})

// Compte le quota PAR COMPTE plutôt que par IP : chez les opérateurs mobiles
// algériens, des milliers d'abonnés partagent une même IP publique (CGNAT), et
// plusieurs administrateurs travaillent souvent depuis le même bureau. Avec une
// clé par IP, des utilisateurs sans lien entre eux se bloquaient mutuellement.
// Ces limiteurs s'exécutent avant `authenticate`, d'où la lecture directe du JWT.
const keyByAccountOrIp = (req) => {
  const token = req.cookies?.token
    || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null)

  if (token) {
    try {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET)
      if (userId) return `user:${userId}`
    } catch { /* jeton absent/expiré : on retombe sur l'IP */ }
  }
  // Visiteur non authentifié : l'IP reste le seul identifiant disponible.
  return `ip:${req.ip}`
}

const videoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 300,
  message: { error: t('errors.video_rate_limited', 'fr'), code: 'VIDEO_RATE_LIMITED' },
  keyGenerator: keyByAccountOrIp,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: t('errors.auth_rate_limited', 'fr'), code: 'AUTH_RATE_LIMITED' },
  skip: (req) => {
    const p = req.path.toLowerCase()
    return !['/login', '/register', '/refresh', '/forgot-password', '/reset-password'].includes(p)
  },
})

// Le tableau de bord admin est un écran de supervision : il rafraîchit la
// présence toutes les 5 s, soit ~180 requêtes par fenêtre de 15 min pour ce
// seul écran. Avec l'ancien plafond de 100, l'administrateur se bloquait
// lui-même au bout de ~8 minutes, puis voyait 15 minutes d'erreurs.
// 600 laissent la marge du rafraîchissement + la navigation, tout en coupant
// court à un usage réellement abusif.
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: { error: t('errors.rate_limited', 'fr'), code: 'ADMIN_RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByAccountOrIp,
})

// Webhook limiter (très strict)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many webhook calls.', code: 'WEBHOOK_RATE_LIMITED' },
})

// ─── Middlewares globaux (ordre critique!) ─────────────────────
app.disable('x-powered-by')

// Trust proxy (pour reverse proxy: Nginx, Cloudflare, Railway)
if (isProd) {
  app.set('trust proxy', 1)
}

// 1. Request ID (premier — nécessaire pour tout le tracing)
app.use(requestId)

// Force HTTPS (Chiffrement SSL) & Hide Server Version
if (isProd) {
  app.use((req, res, next) => {
    // Retirer l'en-tête Server si ajouté par défaut ou proxy
    res.removeHeader('Server')
    
    // Redirection HTTP vers HTTPS
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`)
    }
    next()
  })
} else {
  app.use((req, res, next) => {
    res.removeHeader('Server')
    next()
  })
}


// 2. Block suspicious user agents (bots/scanners)
app.use(blockSuspiciousUA)

// 3. HTTP logging
app.use(httpLogger)

// 4. Request Timeout (30s pour API, pas pour vidéo/upload)
app.use(requestTimeout(30000))

// 5. Compression gzip (~70% bandwidth reduction)
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.path.startsWith('/api/video/') && !req.path.includes('/token/')) {
      return false
    }
    return compression.filter(req, res)
  },
}))

// 6. Security headers via Helmet
app.use(helmet({
  contentSecurityPolicy: isProd ? {
    directives: {
      defaultSrc: ["'self'"],
      // accounts.google.com/gsi + connect.facebook.net : scripts injectés côté
      // client par @react-oauth/google et le SDK JS Facebook pour les boutons
      // "Continuer avec Google/Facebook" — sans ça, CSP bloque silencieusement
      // ces logins en production alors qu'ils fonctionnent en dev (CSP désactivée).
      scriptSrc: ["'self'", 'https://accounts.google.com', 'https://connect.facebook.net'],
      // accounts.google.com/gsi/style : feuille de style du bouton « Se connecter avec Google »
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://accounts.google.com/gsi/style'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      // www.facebook.com : destination des évènements du pixel Meta (/tr).
      // fbevents.js les envoie en fetch/beacon, pas seulement en image — sans
      // cette entrée, les conversions seraient perdues silencieusement.
      connectSrc: [
        "'self'",
        'https://accounts.google.com',
        'https://graph.facebook.com', 'https://www.facebook.com',
      ],
      // Les hébergeurs vidéo doivent figurer ici : UniversalVideoPlayer affiche
      // chaque leçon dans une iframe (toutes les leçons actuelles sont YouTube).
      // Sans eux, la CSP bloque le lecteur en production alors que tout
      // fonctionne en dev, où la CSP est désactivée.
      frameSrc: [
        "'self'",
        'https://accounts.google.com', 'https://www.facebook.com', 'https://web.facebook.com',
        'https://www.youtube.com', 'https://www.youtube-nocookie.com',
        'https://player.vimeo.com', 'https://www.loom.com', 'https://drive.google.com',
        'https://www.google.com', // carte du lieu de la formation présentielle
      ],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  // Allow cross-origin resource loading only for same-site in production
  crossOriginResourcePolicy: isProd ? { policy: 'same-site' } : false,
}))

// 7. Additional security headers
app.use(securityHeaders)

// 8. HPP (HTTP Parameter Pollution)
app.use(hpp())

// 9. CORS dynamique
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    // Une requête SANS en-tête Origin n'est pas une requête cross-origin :
    // c'est une navigation directe (l'utilisateur tape l'URL), un robot
    // d'indexation, un aperçu de lien social ou une sonde de santé. Les
    // refuser rendait le site totalement inaccessible en production — pages,
    // robots.txt et sitemap.xml répondaient 403.
    //
    // Cela n'affaiblit pas la protection CSRF : elle repose sur le double
    // cookie et SameSite=Strict, et toute requête cross-site déclenchée par
    // un navigateur porte forcément un Origin, donc reste filtrée ci-dessous.
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  maxAge: 86400, // Cache CORS preflight 24h
}))

// 10. Body & Cookie parsing (strict limits)
// Capture raw body for webhook signature verification (Chargily, Edahabia)
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook routes that need HMAC verification
    if (req.originalUrl && (
      req.originalUrl.includes('/api/payments/chargily/webhook') ||
      req.originalUrl.includes('/api/payments/edahabia/webhook') ||
      req.originalUrl.includes('/api/payments/stripe/webhook')
    )) {
      req.rawBody = buf
    }
  },
}))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())

// CSRF Protection MUST come after cookie parsing
app.use(ensureCsrfToken)
app.use(validateCsrf)

// 11. Payload size guard per route
app.use(payloadGuard)

// 12. XSS Sanitization
app.use(xssSanitizer)

// 13. Language detection (i18n)
app.use(detectLanguage)

const { authenticate, isAdmin } = require('./middleware/auth')

// ─── Fichiers statiques (avec headers sécurisés) ──────────────
// Pièces d'identité des formateurs : strictement réservées aux administrateurs
// et jamais mises en cache (données personnelles sensibles).
app.use('/uploads/identities', authenticate, isAdmin, express.static(path.join(__dirname, 'uploads/identities'), {
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'no-store, private')
  },
}))
// Reçus de paiement : preuves de paiement nominatives (nom, numéro CCP,
// montant). Deux garde-fous indispensables ici :
//   1. Vérifier la PROPRIÉTÉ, pas seulement « connecté » : sinon n'importe quel
//      compte peut lire le reçu d'un autre en connaissant le nom de fichier.
//   2. Ne jamais autoriser un cache partagé : express.static posait
//      "Cache-Control: public, max-age=604800" sur un contenu privé, ce qui
//      permet à un CDN de le resservir à n'importe qui, authentification
//      totalement court-circuitée.
app.get('/uploads/receipts/:file', authenticate, async (req, res, next) => {
  try {
    // basename() neutralise toute tentative de remontée de répertoire
    const file = path.basename(req.params.file)
    const publicPath = `/uploads/receipts/${file}`

    // Le fichier peut appartenir à un achat (Receipt) ou à une candidature
    // formateur (InstructorApplication) : les deux stockent ce même chemin.
    const [receipt, application] = await Promise.all([
      prisma.receipt.findFirst({ where: { receiptImage: publicPath }, select: { userId: true } }),
      prisma.instructorApplication.findFirst({ where: { receiptImage: publicPath }, select: { userId: true } }),
    ])

    const ownerId = receipt?.userId ?? application?.userId
    if (ownerId === undefined) return res.status(404).end()

    if (ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé.' })
    }

    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'no-store, private')
    res.setHeader('Vary', 'Cookie, Authorization')
    res.sendFile(path.join(__dirname, 'uploads/receipts', file), (err) => {
      if (err) res.status(404).end()
    })
  } catch (err) { next(err) }
})
app.use('/uploads/thumbnails', express.static(path.join(__dirname, 'uploads/thumbnails'), {
  maxAge: '30d',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
  },
}))
app.use('/uploads/intro', express.static(path.join(__dirname, 'uploads/intro'), {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
  },
}))

// ─── Routes SEO (robots.txt + sitemap) ────────────────────────
app.use('/', seoRoutes)

// ─── Routes API ───────────────────────────────────────────────
// Auth: anti-enumeration on login/register pour prévenir les timing attacks
app.use('/api/auth', authLimiter, apiLimiter, antiEnumeration(100), authRoutes)
app.use('/api/courses', apiLimiter, courseRoutes)
app.use('/api/video', videoLimiter, videoRoutes)
app.use('/api/payments', apiLimiter, paymentRoutes)
// Webhook a son propre limiter strict
app.use('/api/payments/edahabia/webhook', webhookLimiter)
app.use('/api/payments/chargily/webhook', webhookLimiter)
app.use('/api/payments/stripe/webhook', webhookLimiter)
app.use('/api/payments/paypal/webhook', webhookLimiter)
app.use('/api/admin', adminLimiter, adminRoutes)
app.use('/api/instructor', apiLimiter, instructorRoutes)

// Réservation publique sans compte : plafond strict par IP contre le remplissage
// du calendrier par un robot (une vraie personne réserve 1 ou 2 créneaux).
const coachingBookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  // Assez haut pour plusieurs abonnés mobiles derrière une même IP (CGNAT),
  // assez bas pour stopper un robot ; le piège anti-robot et le refus des
  // doublons par numéro complètent ce plafond.
  max: 12,
  message: { error: 'Trop de réservations depuis cette connexion. Réessayez plus tard.', code: 'COACHING_RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/coaching/book', coachingBookLimiter)
app.use('/api/coaching', apiLimiter, coachingRoutes)
app.use('/api/in-person/register', coachingBookLimiter)
app.use('/api/in-person/join', coachingBookLimiter)
app.use('/api/in-person', apiLimiter, inPersonRoutes)
app.use('/api/contest/enter', coachingBookLimiter)
app.use('/api/contest', apiLimiter, contestRoutes)

// ─── Analytics Public Track Click Route ──────────────────────
// Endpoint non authentifié qui écrit en base : sans limite, n'importe qui peut
// remplir la table ClickLog jusqu'à saturer le disque. Les limiteurs globaux
// sont montés par préfixe (/api/auth, /api/courses…) et ne couvraient pas
// cette route déclarée directement sur app.post.
const trackClickLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // le tracking est fréquent mais jamais en rafale
  message: { error: 'Trop de requêtes de tracking.', code: 'TRACK_RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.post('/api/analytics/track-click', trackClickLimiter, async (req, res) => {
  try {
    const { pageUrl, elementText, elementTag, elementId } = req.body || {}
    if (!pageUrl) return res.status(400).json({ error: 'Missing pageUrl' })

    let userId = null
    let userName = 'Visiteur Anonyme'
    let userEmail = null
    let isGuest = true

    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.token

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, name: true, email: true }
        })
        if (user) {
          userId = user.id
          userName = user.name || 'Utilisateur'
          userEmail = user.email
          isGuest = false
        }
      } catch (e) {}
    }

    const clickLog = await prisma.clickLog.create({
      data: {
        userId,
        userName,
        userEmail,
        isGuest,
        pageUrl: String(pageUrl).slice(0, 250),
        elementText: elementText ? String(elementText).trim().slice(0, 200) : null,
        elementTag: elementTag ? String(elementTag).toUpperCase().slice(0, 50) : null,
        elementId: elementId ? String(elementId).slice(0, 100) : null,
        ip: String(req.ip || '127.0.0.1').slice(0, 45)
      }
    })

    res.json({ success: true, id: clickLog.id })
  } catch (err) {
    res.status(500).json({ error: 'Click tracking error' })
  }
})

const { getSettings } = require('./settingsManager')

// ─── Configuration Publique (cachable 5 min) ─────────────────
app.get('/api/config/intro-video', (req, res) => {
  const settings = getSettings()
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.json({ introVideoUrl: settings.introVideoUrl })
})

app.get('/api/config/mission', (req, res) => {
  const settings = getSettings()
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.json({ mission: settings.mission })
})

app.get('/api/config/site', (req, res) => {
  const all = getSettings()
  // Le code du QR d'inscription ne doit jamais être public.
  const { joinCode, ...inPerson } = all.inPerson || {}
  const settings = { ...all, inPerson }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Expires', '0')
  res.json({ settings })
})

// ─── Health Check (vérifie aussi la DB) ──────────────────────
app.get('/api/health', async (req, res) => {
  const startTime = Date.now()
  try {
    // Use parameterized $queryRaw instead of $queryRawUnsafe (OWASP: Injection prevention)
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - startTime
    const response = {
      status: 'ok',
      platform: 'Mylta Academy API',
      database: 'connected',
      dbLatencyMs: dbLatency,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    }
    // Only expose detailed memory info in development (info disclosure prevention)
    if (!isProd) {
      response.memory = {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      }
    }
    res.json(response)
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      platform: 'Mylta Academy API',
      database: 'disconnected',
      error: isProd ? 'Database unavailable' : err.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// ─── Production: Servir le build React avec Prerendering SEO ──
if (isProd) {
  const frontendDist = path.join(__dirname, '../frontend/dist')
  if (fs.existsSync(frontendDist)) {
    // Liste des User-Agents des robots sociaux
    const botUserAgents = [
      // Moteurs de recherche (SEO critique)
      'googlebot', 'bingbot', 'yandexbot', 'baiduspider', 'duckduckbot',
      'slurp', 'ia_archiver', 'applebot',
      // Robots sociaux (partage de liens)
      'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 
      'telegrambot', 'skypeuripreview', 'pinterest', 'vkshare'
    ]

    // Servir les fichiers statiques (JS, CSS, images) sauf index.html
    app.use(express.static(frontendDist, { index: false, maxAge: '1y', immutable: true }))

    app.get('*', async (req, res, next) => {
      // Ce catch-all est monté avant le 404 JSON de '/api/*' (plus bas dans le
      // fichier). Sans cette sortie, une route API inconnue (typo, endpoint
      // supprimé) recevait le index.html de l'app React avec un statut 200 au
      // lieu d'un 404 JSON — les clients ne pouvaient jamais distinguer une
      // route API manquante d'une page existante.
      if (req.path.startsWith('/api/')) return next()

      const ua = (req.headers['user-agent'] || '').toLowerCase()
      const isBot = botUserAgents.some(bot => ua.includes(bot))

      // Si ce n'est pas un bot social, on envoie le index.html normal (CSR)
      if (!isBot) {
        return res.sendFile(path.join(frontendDist, 'index.html'))
      }

      // ─── PRERENDERING POUR LES BOTS SOCIAUX ───
      try {
        let html = fs.readFileSync(path.join(frontendDist, 'index.html'), 'utf8')
        const SITE = process.env.SITE_URL || 'https://myltaacademy.com'
        let title = 'Mylta Academy | Formation Premium & Outils de Réussite'
        let description = 'Mylta Academy — La plateforme e-learning de référence en Algérie. Formations pratiques, outils, IA et masterclass accessibles depuis votre smartphone.'
        let image = `${SITE}/og-image.png`
        const canonical = `${SITE}${req.path}`

        // Page de formation
        const courseMatch = req.path.match(/^\/courses\/(\d+)$/)
        if (courseMatch) {
          const courseId = parseInt(courseMatch[1], 10)
          const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { title: true, description: true, thumbnail: true }
          })
          if (course) {
            title = `${course.title} | Mylta Academy`
            description = course.description || description
            // Les robots sociaux n'interprètent jamais une URL relative
            if (course.thumbnail) {
              image = course.thumbnail.startsWith('http') ? course.thumbnail : `${SITE}${course.thumbnail}`
            }
          }
        }

        const escapeHtml = (unsafe) => {
          return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        };

        const safeTitle = escapeHtml(title);
        const safeDescription = escapeHtml(description);
        const safeImage = escapeHtml(image);

        const safeCanonical = escapeHtml(canonical)

        const ogTags = `
          <title>${safeTitle}</title>
          <meta name="description" content="${safeDescription}" />
          <link rel="canonical" href="${safeCanonical}" />
          <meta property="og:title" content="${safeTitle}" />
          <meta property="og:description" content="${safeDescription}" />
          <meta property="og:image" content="${safeImage}" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:url" content="${safeCanonical}" />
          <meta property="og:site_name" content="Mylta Academy" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${safeTitle}" />
          <meta name="twitter:description" content="${safeDescription}" />
          <meta name="twitter:image" content="${safeImage}" />
        `

        // index.html porte déjà un <title> et une meta description statiques.
        // Sans ce retrait, la page servie aux robots en contenait DEUX : un
        // document invalide, où le titre retenu dépend du crawler.
        html = html
          .replace(/<title>[\s\S]*?<\/title>/i, '')
          .replace(/<meta\s+name="description"[\s\S]*?\/?>/i, '')
          .replace('<head>', `<head>\n${ogTags}`)

        res.send(html)

      } catch (err) {
        console.error('Erreur Prerendering:', err)
        res.sendFile(path.join(frontendDist, 'index.html'))
      }
    })
    console.log(`📦 Mode production: Serveur React depuis ${frontendDist} (Prerendering Actif)`)
  } else {
    console.warn(`⚠️  Dossier frontend/dist introuvable. Exécutez 'npm run build' à la racine.`)
  }
}

// ─── 404 pour routes API inconnues ────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: t('errors.not_found', req.lang), code: 'NOT_FOUND' })
})

// ─── Middleware d'erreurs global ──────────────────────────────
app.use(errorHandler)

// ─── Graceful Shutdown ────────────────────────────────────────
let server
let isShuttingDown = false

async function gracefulShutdown(signal) {
  if (isShuttingDown) return
  isShuttingDown = true

  console.log(`\n\x1b[33m⏳ [${signal}] Arrêt gracieux en cours...\x1b[0m`)

  // Timeout de sécurité (10s max) — annulé si l'arrêt se termine avant.
  const forceExitTimer = setTimeout(() => {
    console.error('\x1b[31m❌ Arrêt forcé après timeout.\x1b[0m')
    process.exit(1)
  }, 10000)

  // Refuser les nouvelles connexions et attendre que les requêtes en cours se terminent
  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('\x1b[32m✅ Serveur HTTP fermé.\x1b[0m')
        resolve()
      })
    })
  }

  // Fermer Prisma
  try {
    await prisma.$disconnect()
    console.log('\x1b[32m✅ Prisma déconnecté.\x1b[0m')
  } catch (err) {
    console.error('\x1b[31m❌ Erreur déconnexion Prisma:\x1b[0m', err)
  }

  clearTimeout(forceExitTimer)
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// ─── Uncaught exception handlers ──────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('\x1b[31m💥 [UNCAUGHT EXCEPTION]\x1b[0m', err)
  gracefulShutdown('UNCAUGHT_EXCEPTION')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('\x1b[31m💥 [UNHANDLED REJECTION]\x1b[0m', reason)
})

// ─── Démarrage du serveur ──────────────────────────────────────
async function main() {
  try {
    await prisma.$connect()
    console.log('\x1b[32m✅ Prisma connecté\x1b[0m')

    server = app.listen(PORT, () => {
      initSocket(server, allowedOrigins)
      initCron()
      
      console.log('\n' + '═'.repeat(55))
      console.log('  🎓  Mylta Academy API — Production Ready')
      console.log('═'.repeat(55))
      console.log(`  🌐  http://localhost:${PORT}`)
      console.log(`  ⚙️   Mode: ${process.env.NODE_ENV || 'development'}`)
      console.log(`  🌍  i18n: fr, en, ar`)
      console.log(`  🔒  Security: Helmet + HPP + XSS + CORS + Timeout`)
      console.log(`  🛡️   Guards: Anti-enum + Bot-block + Payload-guard`)
      console.log(`  📦  Compression: gzip enabled`)
      console.log(`  ⏱️   Timeout: 30s per request`)
      console.log('\n  📡  Endpoints:')
      console.log('  POST /api/auth/register, /login, /refresh')
      console.log('  GET  /api/auth/me, /notifications, /my-courses')
      console.log('  GET  /api/courses?page=1&limit=20&lang=fr')
      console.log('  GET  /api/video/:lessonId  (proxy sécurisé)')
      console.log('  POST /api/payments/receipt')
      console.log('  ALL  /api/admin/*  (admin only)')
      console.log('  GET  /api/health  (health + DB + memory)')
      console.log('  GET  /robots.txt & /sitemap.xml')
      console.log('═'.repeat(55) + '\n')
    })
  } catch (error) {
    console.error('\x1b[31m❌ Échec du démarrage:\x1b[0m', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
