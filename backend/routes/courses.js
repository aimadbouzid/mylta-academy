// ============================================================
// ROUTES COURSES — Mylta Academy (Production-Ready)
// Pagination, Cache Headers, Real Counts, i18n
// ============================================================

const express = require('express')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')
const { authenticate } = require('../middleware/auth')
const { t } = require('../i18n')
const { validateId } = require('../middleware/security')
const { accessReasonFor, hasCourseAccess, accessContext, contextGrants } = require('../utils/courseAccess')
const { getIO } = require('../socket')
const { logSecurityEvent } = require('../utils/securityLogger')
const rateLimit = require('express-rate-limit')

const router = express.Router()

const progressLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { error: 'Trop de requêtes de progression', code: 'PROGRESS_RATE_LIMITED' }
})

const refundLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de requêtes de choix de remboursement', code: 'REFUND_RATE_LIMITED' }
})

// ─── GET /api/courses — Liste paginée des formations (public) ─
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const { category, level, search } = req.query
    const where = { isPublished: true }

    if (category && category !== 'Tous') where.category = category
    if (level && level !== 'Tous') where.level = level
    if (search) where.title = { contains: search }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true, title: true, description: true, price: true,
          discountPrice: true, discountEndsAt: true,
          thumbnail: true, category: true, duration: true, level: true, createdAt: true,
          instructorId: true,
          instructor: { select: { id: true, name: true, instructorBio: true } },
          _count: { select: { lessons: true, receipts: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ])

    // Vérifier si l'utilisateur authentifié a accès
    let access = { isClubMember: false, isAdmin: false, purchased: new Set() }
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null)
    if (token) {
      try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET)
        access = await accessContext(userId)
      } catch (_) { /* Token invalide, ignorer */ }
    }

    const enriched = courses.map(c => {
      const ratingAvg = c.reviews.length > 0
        ? c.reviews.reduce((acc, r) => acc + r.rating, 0) / c.reviews.length
        : 0
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        price: c.price,
        discountPrice: c.discountPrice,
        discountEndsAt: c.discountEndsAt,
        thumbnail: c.thumbnail,
        category: c.category,
        duration: c.duration,
        level: c.level,
        createdAt: c.createdAt,
        lessonsCount: c._count.lessons,
        studentsCount: c._count.receipts,  // Vrais compteurs, plus de fake data
        rating: ratingAvg || 0,
        reviewsCount: c.reviews.length,
        hasAccess: contextGrants(access, c.id),
        instructorId: c.instructorId,
        instructor: c.instructor || null,
      }
    })

    // JAMAIS de cache partagé : la réponse contient hasAccess, propre à chaque
    // compte. Avec "public", un cache (navigateur, proxy, CDN) resservait la
    // réponse d'un acheteur à un visiteur anonyme.
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('Vary', 'Cookie, Authorization')

    res.json({
      courses: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) { next(err) }
})

// ─── GET /api/courses/:id — Détail d'une formation (public) ──
router.get('/:id', async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: {
        id: true, title: true, description: true, price: true,
        discountPrice: true, discountEndsAt: true, showSyllabus: true,
        thumbnail: true, category: true, duration: true, level: true, createdAt: true,
        instructorId: true,
        instructor: { select: { id: true, name: true, instructorBio: true } },
        _count: { select: { lessons: true, receipts: true } },
        reviews: { select: { rating: true, comment: true, user: { select: { name: true } } } },
        lessons: {
          select: {
            id: true, title: true, description: true, order: true, duration: true, externalVideoUrl: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!course) return res.status(404).json({ error: t('courses.not_found', req.lang) })

    // Vérifier si l'utilisateur authentifié a accès
    let hasAccess = false
    let userProgress = []
    // Pourquoi l'accès est accordé : "PURCHASE" (achat) ou "ADMIN" (privilège
    // d'administration). L'interface doit distinguer les deux, sinon un admin
    // lit « Vous possédez déjà cette formation » pour un cours que personne
    // n'a acheté — ce qui donne l'impression que tout est déverrouillé.
    let accessReason = null

    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null)
    if (token) {
      try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET)
        const [reason, progress] = await Promise.all([
          accessReasonFor(userId, courseId),
          prisma.lessonProgress.findMany({
            where: { userId, lesson: { courseId } },
          }),
        ])
        if (reason) {
          hasAccess = true
          accessReason = reason
          userProgress = progress.map(p => p.lessonId)
        }
      } catch (_) { /* Token invalide */ }
    }

    // Masquer le syllabus si restreint
    if (!course.showSyllabus && !hasAccess) {
      course.lessons = []
    } else {
      // Nettoyer l'URL vidéo externe pour éviter de l'exposer (sauf si c'est YouTube/Vimeo/Loom et qu'on a accès)
      course.lessons = course.lessons.map(lesson => {
        let keepUrl = false;
        if (hasAccess && lesson.externalVideoUrl) {
          const url = lesson.externalVideoUrl.toLowerCase();
          if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('loom.com')) {
            keepUrl = true;
          }
        }
        const { externalVideoUrl, ...rest } = lesson;
        return keepUrl ? { ...rest, externalVideoUrl } : rest;
      });
    }

    const ratingAvg = course.reviews.length > 0
      ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
      : 0

    // JAMAIS de cache partagé : la réponse contient hasAccess, userProgress et
    // surtout les URLs vidéo des leçons pour les acheteurs. Mise en cache
    // "public", elle fuitait ces URLs vers les visiteurs non connectés.
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('Vary', 'Cookie, Authorization')

    res.json({
      ...course,
      rating: ratingAvg || 0,
      hasAccess,
      accessReason,
      userProgress,
      lessonsCount: course._count.lessons,
      studentsCount: course._count.receipts,
    })
  } catch (err) { next(err) }
})

// ─── POST /api/courses/:id/progress ──────────────────────────
router.post('/:id/progress', authenticate, progressLimiter, async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const { lessonId, isCompleted } = req.body
    const parsedLessonId = validateId(lessonId)
    if (!parsedLessonId) return res.status(400).json({ error: t('courses.lesson_invalid', req.lang) })

    const userId = req.user.id

    // Vérifier que la leçon appartient au cours
    const lesson = await prisma.lesson.findUnique({
      where: { id: parsedLessonId },
      select: { courseId: true, order: true },
    })
    if (!lesson || lesson.courseId !== courseId) {
      return res.status(400).json({ error: t('courses.lesson_not_in_course', req.lang) })
    }

    // Vérifier l'accès et suspension
    if (!(await hasCourseAccess(userId, courseId))) {
      return res.status(403).json({ error: t('courses.access_denied', req.lang) })
    }

    // Verrou séquentiel : Impossible de terminer une vidéo si la précédente n'est pas terminée
    if (isCompleted) {
      const previousLesson = await prisma.lesson.findFirst({
        where: { courseId, order: { lt: lesson.order } },
        orderBy: { order: 'desc' },
      })
      if (previousLesson) {
        const prevProgress = await prisma.lessonProgress.findUnique({
          where: { userId_lessonId: { userId, lessonId: previousLesson.id } }
        })
        if (!prevProgress || !prevProgress.isCompleted) {
          logSecurityEvent({ userId, action: 'PROGRESS_BYPASS_ATTEMPT', details: `Tentative de valider leçon ${parsedLessonId} sans valider la précédente (${previousLesson.id})`, ip: req.ip })
          // t() renvoie la clé elle-même si la traduction manque : le repli
          // `|| "…"` ne se déclenchait donc jamais et affichait la clé brute.
          return res.status(403).json({ error: t('courses.complete_previous_first', req.lang) })
        }
      }
    }

    if (isCompleted) {
      await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: parsedLessonId } },
        update: { isCompleted: true },
        create: { userId, lessonId: parsedLessonId, isCompleted: true },
      })
    } else {
      await prisma.lessonProgress.deleteMany({
        where: { userId, lessonId: parsedLessonId },
      })
    }

    try {
      const io = getIO()
      io.to(`user_${userId}`).emit('SYNC_PROGRESS', {
        courseId,
        lessonId: parsedLessonId,
        isCompleted: !!isCompleted
      })
    } catch (e) {
      console.warn('Socket emission failed:', e.message)
    }

    res.json({ message: t('courses.progress_updated', req.lang) })
  } catch (err) { next(err) }
})



// ─── POST /api/courses/:id/rate ──────────────────────────────
router.post('/:id/rate', authenticate, async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const { rating, comment } = req.body
    const userId = req.user.id

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: t('courses.rating_invalid', req.lang) })
    }

    if (!(await hasCourseAccess(userId, courseId))) {
      return res.status(403).json({ error: t('courses.must_buy_to_rate', req.lang) })
    }

    const review = await prisma.courseReview.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { rating, comment },
      create: { userId, courseId, rating, comment },
    })

    res.json({ message: t('courses.review_saved', req.lang), review })
  } catch (err) { next(err) }
})

// ─── POST /api/courses/:id/reviews ──────────────────────────────
router.post('/:id/reviews', authenticate, async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: 'ID de formation invalide.' })

    const { rating, comment } = req.body
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La note doit être comprise entre 1 et 5.' })
    }

    const userId = req.user.id

    // Seuls les inscrits notent : membres du club et anciens acheteurs.
    if (!(await hasCourseAccess(userId, courseId))) {
      return res.status(403).json({ error: 'Cette formation est réservée aux membres du club.' })
    }

    // Créer ou mettre à jour l'avis (Upsert)
    const existingReview = await prisma.courseReview.findFirst({
      where: { userId, courseId }
    })

    let review;
    if (existingReview) {
      review = await prisma.courseReview.update({
        where: { id: existingReview.id },
        data: { rating, comment }
      })
    } else {
      review = await prisma.courseReview.create({
        data: { userId, courseId, rating, comment }
      })
    }


    res.json({ message: 'Avis enregistré avec succès !', review })
  } catch (err) { next(err) }
})

module.exports = router
