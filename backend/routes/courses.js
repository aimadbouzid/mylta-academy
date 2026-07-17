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
const { getIO } = require('../socket')

const router = express.Router()

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
    let purchasedCourseIds = new Set()
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null)
    if (token) {
      try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET)
        const receipts = await prisma.receipt.findMany({
          where: { userId, status: 'APPROVED' },
          select: { courseId: true },
        })
        receipts.forEach(r => purchasedCourseIds.add(r.courseId))
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
        hasAccess: purchasedCourseIds.has(c.id),
      }
    })

    // Cache headers pour les routes publiques (60 secondes)
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')

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
        _count: { select: { lessons: true, receipts: true } },
        reviews: { select: { rating: true, comment: true, user: { select: { name: true } } } },
        lessons: {
          select: {
            id: true, title: true, description: true, order: true, duration: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!course) return res.status(404).json({ error: t('courses.not_found', req.lang) })

    // Vérifier si l'utilisateur authentifié a accès
    let hasAccess = false
    let userProgress = []
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null)
    if (token) {
      try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET)
        const [receipt, progress] = await Promise.all([
          prisma.receipt.findFirst({
            where: { userId, courseId, status: 'APPROVED' },
          }),
          prisma.lessonProgress.findMany({
            where: { userId, lesson: { courseId } },
          }),
        ])
        hasAccess = !!receipt
        if (hasAccess) {
          userProgress = progress.map(p => p.lessonId)
        }
      } catch (_) { /* Token invalide */ }
    }

    // Masquer le syllabus si restreint
    if (!course.showSyllabus && !hasAccess) {
      course.lessons = []
    }

    const ratingAvg = course.reviews.length > 0
      ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
      : 0

    // Cache 60 secondes
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')

    res.json({
      ...course,
      rating: ratingAvg || 0,
      hasAccess,
      userProgress,
      lessonsCount: course._count.lessons,
      studentsCount: course._count.receipts,
    })
  } catch (err) { next(err) }
})

// ─── POST /api/courses/:id/progress ──────────────────────────
router.post('/:id/progress', authenticate, async (req, res, next) => {
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
      select: { courseId: true },
    })
    if (!lesson || lesson.courseId !== courseId) {
      return res.status(400).json({ error: t('courses.lesson_not_in_course', req.lang) })
    }

    // Vérifier l'accès
    const receipt = await prisma.receipt.findFirst({
      where: { userId, courseId, status: 'APPROVED' },
    })
    if (!receipt) return res.status(403).json({ error: t('courses.access_denied', req.lang) })

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

    const receipt = await prisma.receipt.findFirst({
      where: { userId, courseId, status: 'APPROVED' },
    })
    if (!receipt) return res.status(403).json({ error: t('courses.must_buy_to_rate', req.lang) })

    const review = await prisma.courseReview.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { rating, comment },
      create: { userId, courseId, rating, comment },
    })

    res.json({ message: t('courses.review_saved', req.lang), review })
  } catch (err) { next(err) }
})

module.exports = router
