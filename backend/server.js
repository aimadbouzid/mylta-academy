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
const prisma     = require('./prisma')
const { initSocket } = require('./socket')

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
const chatbotRoutes = require('./routes/chatbot')
const nlpManager    = require('./chatbot/nlpManager')

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

const videoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 300,
  message: { error: t('errors.video_rate_limited', 'fr'), code: 'VIDEO_RATE_LIMITED' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: t('errors.auth_rate_limited', 'fr'), code: 'AUTH_RATE_LIMITED' },
  skip: (req) => {
    const p = req.path.toLowerCase()
    return p !== '/login' && p !== '/register' && p !== '/refresh'
  },
})

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: t('errors.rate_limited', 'fr'), code: 'ADMIN_RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
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
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
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
    // Reject null or missing origins in production (prevents CORS bypass)
    if (!origin) {
      if (isProd) return callback(new Error('Not allowed by CORS'))
      return callback(null, true) // Allow in dev for tools like Postman
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  maxAge: 86400, // Cache CORS preflight 24h
}))

// 10. Body & Cookie parsing (strict limits)
app.use(express.json({ limit: '1mb' }))
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

// ─── Fichiers statiques (avec headers sécurisés) ──────────────
app.use('/uploads/receipts', express.static(path.join(__dirname, 'uploads/receipts'), {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
  },
}))
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
app.use('/api/auth', authLimiter, apiLimiter, antiEnumeration(300), authRoutes)
app.use('/api/courses', apiLimiter, courseRoutes)
app.use('/api/video', videoLimiter, videoRoutes)
app.use('/api/payments', apiLimiter, paymentRoutes)
// Webhook a son propre limiter strict
app.use('/api/payments/edahabia/webhook', webhookLimiter)
app.use('/api/admin', adminLimiter, adminRoutes)
app.use('/api/chat', apiLimiter, chatbotRoutes)

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
  const settings = getSettings()
  res.setHeader('Cache-Control', 'public, max-age=300')
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
      'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 
      'telegrambot', 'skypeuripreview', 'pinterest', 'vkshare'
    ]

    // Servir les fichiers statiques (JS, CSS, images) sauf index.html
    app.use(express.static(frontendDist, { index: false, maxAge: '1y', immutable: true }))

    app.get('*', async (req, res) => {
      const ua = (req.headers['user-agent'] || '').toLowerCase()
      const isBot = botUserAgents.some(bot => ua.includes(bot))

      // Si ce n'est pas un bot social, on envoie le index.html normal (CSR)
      if (!isBot) {
        return res.sendFile(path.join(frontendDist, 'index.html'))
      }

      // ─── PRERENDERING POUR LES BOTS SOCIAUX ───
      try {
        let html = fs.readFileSync(path.join(frontendDist, 'index.html'), 'utf8')
        let title = 'Mylta Academy | Formation Premium en Algérie'
        let description = 'Développez vos compétences en Marketing Digital, Tech, Business et Design. La plateforme e-learning premium.'
        let image = 'https://myltaacademy.dz/og-image.jpg'

        // Si c'est une page de formation spécifique
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
            image = course.thumbnail || image
          }
        }

        // Injection des balises Open Graph dans le <head>
        const ogTags = `
          <title>${title}</title>
          <meta name="description" content="${description}" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${image}" />
        `
        
        html = html.replace('<head>', `<head>\n${ogTags}`)
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

  // Refuser les nouvelles connexions
  if (server) {
    server.close(() => {
      console.log('\x1b[32m✅ Serveur HTTP fermé.\x1b[0m')
    })
  }

  // Fermer Prisma
  try {
    await prisma.$disconnect()
    console.log('\x1b[32m✅ Prisma déconnecté.\x1b[0m')
  } catch (err) {
    console.error('\x1b[31m❌ Erreur déconnexion Prisma:\x1b[0m', err)
  }

  // Timeout de sécurité (10s max)
  setTimeout(() => {
    console.error('\x1b[31m❌ Arrêt forcé après timeout.\x1b[0m')
    process.exit(1)
  }, 10000)

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

    // Initialisation du Chatbot IA
    await nlpManager.initialize()

    server = app.listen(PORT, () => {
      initSocket(server, allowedOrigins)
      
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
