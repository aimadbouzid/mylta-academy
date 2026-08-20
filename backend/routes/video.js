// ============================================================
// ROUTES VIDEO — Mylta Academy (Production-Ready)
// Proxy vidéo sécurisé + Anti-SSRF + i18n
// ============================================================

const express = require('express')
const axios = require('axios')
const crypto = require('crypto')
const prisma = require('../prisma')
const { authenticate } = require('../middleware/auth')
const { t } = require('../i18n')
const { validateId } = require('../middleware/security')
const { logSecurityEvent } = require('../utils/securityLogger')

const router = express.Router()

// ─── Anti-SSRF: Allowlist de domaines ─────────────────────────
const ALLOWED_VIDEO_DOMAINS = [
  'drive.google.com',
  'docs.google.com',
  'www.googleapis.com',
  'lh3.googleusercontent.com',
  'redirector.googlevideo.com',
  'r1---sn',
  'wetransfer.com',
  'we.tl',
  'storage.googleapis.com',
  'www.w3schools.com',
]

function isAllowedUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const hostname = parsed.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') || hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') || hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') || hostname.startsWith('172.19.') ||
        hostname.startsWith('172.2') || hostname.startsWith('172.3') ||
        hostname === '169.254.169.254' || hostname.endsWith('.internal') ||
        hostname.endsWith('.local')) {
      return false
    }
    return ALLOWED_VIDEO_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))
  } catch {
    return false
  }
}

/**
 * Transforme une URL Google Drive "share" en URL de téléchargement direct.
 */
function transformGoogleDriveUrl(url) {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) {
    return { isDrive: true, id: match[1], url: `https://drive.google.com/uc?export=download&id=${match[1]}` }
  }
  return { isDrive: false, url }
}

// Cache pour les URLs directes Google Drive (2h TTL)
const driveLinkCache = new Map()

async function getDriveDirectStream(fileId, reqHeaders) {
  const cached = driveLinkCache.get(fileId)
  if (cached && cached.expiresAt > Date.now()) {
    try {
      return await axios.get(cached.finalUrl, {
        responseType: 'stream',
        headers: { ...reqHeaders, Cookie: cached.cookieString },
        maxRedirects: 5,
        timeout: 30000,
      })
    } catch (err) {
      driveLinkCache.delete(fileId)
    }
  }

  const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`

  const res1 = await axios.get(initialUrl, {
    responseType: 'stream',
    headers: reqHeaders,
    maxRedirects: 0,
    validateStatus: status => status >= 200 && status < 400,
  })

  if (res1.status >= 300 && res1.status < 400 && res1.headers.location) {
    const cookies = res1.headers['set-cookie'] || []
    const cookieString = cookies.map(c => c.split(';')[0]).join('; ')
    const finalUrl = res1.headers.location

    driveLinkCache.set(fileId, { finalUrl, cookieString, expiresAt: Date.now() + 2 * 60 * 60 * 1000 })

    return await axios.get(finalUrl, {
      responseType: 'stream',
      headers: { ...reqHeaders, Cookie: cookieString },
      maxRedirects: 5,
      timeout: 30000,
    })
  }

  if (res1.status === 200 && res1.headers['content-type'] && !res1.headers['content-type'].includes('text/html')) {
    return res1
  }

  const chunks = []
  for await (const chunk of res1.data) chunks.push(chunk)
  const html = Buffer.concat(chunks).toString('utf-8')

  const confirmMatch = html.match(/confirm=([a-zA-Z0-9_-]+)/)
  const confirmToken = confirmMatch ? confirmMatch[1] : 't'

  const cookies = res1.headers['set-cookie'] || []
  const cookieString = cookies.map(c => c.split(';')[0]).join('; ')

  const finalUrl = `https://drive.google.com/uc?export=download&confirm=${confirmToken}&id=${fileId}`

  driveLinkCache.set(fileId, { finalUrl, cookieString, expiresAt: Date.now() + 2 * 60 * 60 * 1000 })

  return await axios.get(finalUrl, {
    responseType: 'stream',
    headers: { ...reqHeaders, Cookie: cookieString },
    maxRedirects: 5,
    timeout: 30000,
  })
}

// ─── Token vidéo éphémère HMAC ────────────────────────────────
const VIDEO_TOKEN_SECRET = process.env.JWT_SECRET + '_video_token'
// Le jeton doit couvrir la lecture COMPLÈTE d'une leçon : le lecteur redemande
// des morceaux (requêtes Range) tout au long de la vidéo. À 10 minutes, la
// lecture d'un cours d'1 h se coupait en plein milieu — or les leçons vont
// jusqu'à 4 h. 6 h laissent la marge des pauses et des retours en arrière.
//
// Allonger cette durée n'affaiblit pas l'accès : la route de streaming
// revérifie à CHAQUE requête la session active, le reçu approuvé et le verrou
// séquentiel. Le jeton n'est qu'un laissez-passer de transport ; la véritable
// autorisation est recalculée en base à chaque appel.
const VIDEO_TOKEN_TTL = 6 * 60 * 60 * 1000 // 6 heures

function generateVideoToken(userId, courseId, lessonId, sessionId) {
  const expires = Date.now() + VIDEO_TOKEN_TTL
  const payload = `${userId}:${courseId}:${lessonId}:${sessionId}:${expires}`
  const signature = crypto.createHmac('sha256', VIDEO_TOKEN_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

function validateVideoToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length !== 6) return null
    const [userId, courseId, lessonId, sessionId, expires, signature] = parts
    if (Date.now() > parseInt(expires)) return null
    const payload = `${userId}:${courseId}:${lessonId}:${sessionId}:${expires}`
    const expected = crypto.createHmac('sha256', VIDEO_TOKEN_SECRET).update(payload).digest('hex')
    // Timing-safe comparison (OWASP ASVS)
    const sigBuf = Buffer.from(signature, 'utf8')
    const expBuf = Buffer.from(expected, 'utf8')
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null
    return { userId: parseInt(userId), courseId: parseInt(courseId), lessonId: parseInt(lessonId), sessionId }
  } catch {
    return null
  }
}

// ─── POST /api/video/token/:lessonId ──────────────────────────
router.post('/token/:lessonId', authenticate, async (req, res, next) => {
  try {
    const lessonId = validateId(req.params.lessonId)
    if (!lessonId) return res.status(400).json({ error: t('video.id_invalid', req.lang) })

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    })
    if (!lesson) return res.status(404).json({ error: t('video.lesson_not_found', req.lang) })

    const receipt = await prisma.receipt.findFirst({
      where: { userId: req.user.id, courseId: lesson.courseId, status: 'APPROVED' },
    })

    if (req.user.role !== 'ADMIN') {
      if (!receipt || receipt.refundStatus === 'REQUESTED') {
        return res.status(403).json({ error: t('video.access_denied', req.lang) })
      }

      const currentLesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
      if (currentLesson) {
        // 1. Verrou de choix de remboursement
        const firstLesson = await prisma.lesson.findFirst({ where: { courseId: lesson.courseId }, orderBy: { order: 'asc' } })
        const isWithin1h = receipt.approvedAt && (Date.now() - new Date(receipt.approvedAt).getTime() < 60 * 60 * 1000)
        if (firstLesson && currentLesson.id !== firstLesson.id && isWithin1h && receipt.refundStatus === 'NONE') {
          return res.status(403).json({ error: "Faites votre choix de remboursement avant de continuer." })
        }

        // 2. Verrou séquentiel
        const previousLesson = await prisma.lesson.findFirst({
          where: { courseId: lesson.courseId, order: { lt: currentLesson.order } },
          orderBy: { order: 'desc' },
        })
        if (previousLesson) {
          const prevProgress = await prisma.lessonProgress.findUnique({
            where: { userId_lessonId: { userId: req.user.id, lessonId: previousLesson.id } }
          })
          if (!prevProgress || !prevProgress.isCompleted) {
            logSecurityEvent({ userId: req.user.id, action: 'VIDEO_BYPASS_ATTEMPT', details: `Tentative accès vidéo sans compléter la précédente (lessonId: ${lessonId})`, ip: req.ip })
            return res.status(403).json({ error: "Vous devez terminer la vidéo précédente." })
          }
        }
      }
    }

    const videoToken = generateVideoToken(req.user.id, lesson.courseId, lessonId, req.sessionId || 'nosession')
    res.json({ videoToken })
  } catch (err) { next(err) }
})

// ─── GET /api/video/:lessonId ─────────────────────────────────
router.get('/:lessonId', async (req, res, next) => {
  const lessonId = validateId(req.params.lessonId)
  if (!lessonId) return res.status(400).json({ error: t('video.id_invalid', req.lang) })

  const videoToken = req.query.vtoken
  let userId
  let courseId
  let sessionId

  if (videoToken) {
    const validated = validateVideoToken(videoToken)
    if (!validated) {
      logSecurityEvent({ action: 'INVALID_VIDEO_TOKEN', details: 'Token expiré ou signature invalide', ip: req.ip })
      return res.status(401).json({ error: t('video.token_expired', req.lang) })
    }
    if (validated.lessonId !== lessonId) {
      logSecurityEvent({ userId: validated.userId, action: 'IDOR_VIDEO_ATTEMPT', details: `Mismatch lessonId: expected ${lessonId} got ${validated.lessonId}`, ip: req.ip })
      return res.status(403).json({ error: t('video.token_mismatch', req.lang) })
    }
    userId = validated.userId
    courseId = validated.courseId
    sessionId = validated.sessionId
  } else {
    return res.status(401).json({ error: t('video.token_required', req.lang) })
  }

  // Vérifier la session active si liée à une session
  if (sessionId && sessionId !== 'nosession') {
    const activeSession = await prisma.userSession.findUnique({ where: { id: sessionId } })
    if (!activeSession) {
      logSecurityEvent({ userId, action: 'REVOKED_SESSION_VIDEO_ACCESS', details: `Tentative d'accès avec une session révoquée`, ip: req.ip })
      return res.status(401).json({ error: 'Session révoquée.', code: 'SESSION_REVOKED' })
    }
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { id: true, title: true } } },
    })
    if (!lesson) return res.status(404).json({ error: t('video.lesson_not_found', req.lang) })

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    const receipt = await prisma.receipt.findFirst({
      where: { userId, courseId: lesson.courseId, status: 'APPROVED' },
    })

    if (user?.role !== 'ADMIN') {
      if (!receipt || receipt.refundStatus === 'REQUESTED') {
        return res.status(403).json({
          error: t('video.access_denied', req.lang),
          courseId: lesson.courseId,
          code: 'NO_ACCESS',
        })
      }

      // Verrou de choix de remboursement
      const firstLesson = await prisma.lesson.findFirst({ where: { courseId: lesson.courseId }, orderBy: { order: 'asc' } })
      const isWithin1h = receipt.approvedAt && (Date.now() - new Date(receipt.approvedAt).getTime() < 60 * 60 * 1000)
      if (firstLesson && lesson.id !== firstLesson.id && isWithin1h && receipt.refundStatus === 'NONE') {
        return res.status(403).json({ error: "Faites votre choix de remboursement avant de continuer." })
      }

      // Verrou séquentiel
      const previousLesson = await prisma.lesson.findFirst({
        where: { courseId: lesson.courseId, order: { lt: lesson.order } },
        orderBy: { order: 'desc' },
      })
      if (previousLesson) {
        const prevProgress = await prisma.lessonProgress.findUnique({
          where: { userId_lessonId: { userId, lessonId: previousLesson.id } }
        })
        if (!prevProgress || !prevProgress.isCompleted) {
          logSecurityEvent({ userId, action: 'VIDEO_BYPASS_ATTEMPT_STREAM', details: `Double check stream bypass (lessonId: ${lessonId})`, ip: req.ip })
          return res.status(403).json({ error: "Vous devez terminer la vidéo précédente." })
        }
      }
    }

    // Audit log
    console.log(JSON.stringify({
      event: 'VIDEO_STREAM',
      userId,
      lessonId,
      lessonTitle: lesson.title,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    const driveInfo = transformGoogleDriveUrl(lesson.externalVideoUrl)

    if (!driveInfo.isDrive && !isAllowedUrl(driveInfo.url)) {
      console.warn(JSON.stringify({
        event: 'SSRF_BLOCKED',
        url: driveInfo.url,
        lessonId,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(403).json({ error: t('video.url_blocked', req.lang), code: 'URL_BLOCKED' })
    }

    const reqHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    if (req.headers.range) reqHeaders['Range'] = req.headers.range

    let upstream
    if (driveInfo.isDrive) {
      upstream = await getDriveDirectStream(driveInfo.id, reqHeaders)
    } else {
      let currentUrl = driveInfo.url
      for (let i = 0; i <= 5; i++) {
        const axiosRes = await axios.get(currentUrl, {
          responseType: 'stream',
          headers: reqHeaders,
          maxRedirects: 0,
          timeout: 30000,
          validateStatus: status => status >= 200 && status < 400,
        })
        if (axiosRes.status >= 300 && axiosRes.status < 400 && axiosRes.headers.location) {
          currentUrl = new URL(axiosRes.headers.location, currentUrl).href
          if (!isAllowedUrl(currentUrl)) {
            console.warn(JSON.stringify({
              event: 'SSRF_BLOCKED_REDIRECT',
              url: currentUrl,
              requestId: req.requestId,
            }))
            return res.status(403).json({ error: t('video.url_blocked', req.lang), code: 'URL_BLOCKED' })
          }
        } else {
          upstream = axiosRes
          break
        }
      }
      if (!upstream) {
        return res.status(502).json({ error: 'Too many redirects' })
      }
    }

    const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges']
    forwardHeaders.forEach(h => {
      if (upstream.headers[h]) res.setHeader(h, upstream.headers[h])
    })

    res.setHeader('Cache-Control', 'no-store, private')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    res.setHeader('Content-Disposition', 'inline; filename="video.mp4"')

    res.status(req.headers.range ? 206 : 200)

    upstream.data.pipe(res)
    upstream.data.on('error', () => {
      if (!res.headersSent) res.status(500).json({ error: t('video.streaming_error', req.lang) })
    })
  } catch (err) {
    if (err.response?.status === 404)
      return res.status(404).json({ error: t('video.source_not_found', req.lang) })
    next(err)
  }
})

module.exports = router
