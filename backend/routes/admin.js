// ============================================================
// ROUTES ADMIN — Mylta Academy (Production-Ready)
// CRUD Formations + Leçons + Paiements + Stats
// Pagination, i18n, Atomic Stats
// ============================================================

const express = require('express')
const prisma = require('../prisma')
const { authenticate, isAdmin } = require('../middleware/auth')
const { t } = require('../i18n')
const { validateId } = require('../middleware/security')
const { validateUploadContent } = require('../middleware/uploadValidator')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

// Appliquer authenticate + isAdmin sur TOUTES les routes
router.use(authenticate, isAdmin)

// ─── Configuration Multer pour Thumbnails ─────────────────────
const thumbDir = path.join(__dirname, '../uploads/thumbnails')
if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true })

const thumbMimeToExt = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, thumbDir) },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = thumbMimeToExt[file.mimetype] || '.bin'
    cb(null, 'thumb-' + uniqueSuffix + ext)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error(t('errors.file_format_invalid', 'fr')))
  },
})

// ─── STATISTIQUES (atomic reads) ──────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalCourses, pendingReceipts, approvedAggregate, totalSalesCount] = await prisma.$transaction([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.receipt.count({ where: { status: 'PENDING' } }),
      prisma.receipt.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.receipt.count({ where: { status: 'APPROVED' } }),
    ])

    const totalRevenue = approvedAggregate._sum.amount || 0

    res.json({
      totalUsers,
      totalCourses,
      pendingReceipts,
      totalRevenue,
      totalSales: totalSalesCount,
    })
  } catch (err) { next(err) }
})

// ─── VALIDATION DES PAIEMENTS (paginé) ───────────────────────
router.get('/receipts', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25))
    const skip = (page - 1) * limit

    const { status = 'PENDING' } = req.query
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED']
    const where = validStatuses.includes(status) ? { status } : {}

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          course: { select: { id: true, title: true, price: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.receipt.count({ where }),
    ])

    res.json({
      receipts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

router.put('/receipts/:id/approve', async (req, res, next) => {
  try {
    const receiptId = validateId(req.params.id)
    if (!receiptId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } })
    if (!receipt) return res.status(404).json({ error: t('admin.receipt_not_found', req.lang) })
    if (receipt.status === 'APPROVED')
      return res.status(409).json({ error: t('admin.receipt_already_approved', req.lang) })

    const updated = await prisma.receipt.update({
      where: { id: receiptId },
      data: { status: 'APPROVED' },
      include: {
        user: { select: { id: true, email: true, name: true } },
        course: { select: { id: true, title: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: updated.user.id,
        title: t('admin.notification_course_unlocked', req.lang),
        message: t('admin.notification_course_unlocked_msg', req.lang, { course: updated.course.title }),
        type: 'SUCCESS',
      },
    })

    // Process Referral System
    const { processReferral } = require('../referralManager')
    await processReferral(updated.user.id, updated.course.title)

    console.log(JSON.stringify({
      event: 'RECEIPT_APPROVED',
      receiptId,
      adminEmail: req.user.email,
      userId: updated.user.id,
      courseTitle: updated.course.title,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    res.json({
      message: t('admin.receipt_approved', req.lang, {
        name: updated.user.name || updated.user.email,
        course: updated.course.title,
      }),
      receipt: updated,
    })
  } catch (err) { next(err) }
})

router.put('/receipts/:id/reject', async (req, res, next) => {
  try {
    const receiptId = validateId(req.params.id)
    if (!receiptId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } })
    if (!receipt) return res.status(404).json({ error: t('admin.receipt_not_found', req.lang) })

    const reason = req.body.reason || 'Image illisible ou informations incorrectes.'

    const updated = await prisma.receipt.update({
      where: { id: receiptId },
      data: { status: 'REJECTED', notes: reason },
      include: {
        user: { select: { id: true, email: true, name: true } },
        course: { select: { title: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: updated.user.id,
        title: t('admin.notification_receipt_rejected', req.lang),
        message: t('admin.notification_receipt_rejected_msg', req.lang, {
          course: updated.course.title,
          reason,
        }),
        type: 'WARNING',
      },
    })

    console.log(JSON.stringify({
      event: 'RECEIPT_REJECTED',
      receiptId,
      adminEmail: req.user.email,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    res.json({ message: t('admin.receipt_rejected', req.lang), receipt: updated })
  } catch (err) { next(err) }
})

// ─── GESTION DES FORMATIONS (CRUD) ──────────────────────────

router.post('/upload-thumbnail', upload.single('image'), validateUploadContent('image'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: t('admin.no_image', req.lang) })
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/thumbnails/${req.file.filename}`
    res.json({ url: fileUrl })
  } catch (err) { next(err) }
})

// GET — Liste formations (paginé)
router.get('/courses', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25))
    const skip = (page - 1) * limit

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        include: {
          lessons: { orderBy: { order: 'asc' } },
          _count: { select: { receipts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course.count(),
    ])

    const enriched = courses.map(c => ({
      ...c,
      lessonsCount: c.lessons.length,
      salesCount: c._count.receipts,
    }))

    res.json({
      courses: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// GET — Détail formation
router.get('/courses/:id', async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { receipts: true } },
      },
    })
    if (!course) return res.status(404).json({ error: t('courses.not_found', req.lang) })

    res.json(course)
  } catch (err) { next(err) }
})

// POST — Créer formation
router.post('/courses', async (req, res, next) => {
  try {
    const { title, description, price, category, level, duration, lessons = [], thumbnail, discountPrice, discountEndsAt, showSyllabus } = req.body

    if (!title || !description || price === undefined)
      return res.status(400).json({ error: t('admin.course_title_desc_price_required', req.lang) })
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0)
      return res.status(400).json({ error: t('admin.course_price_invalid', req.lang) })

    for (const [i, lesson] of lessons.entries()) {
      if (!lesson.title || !lesson.externalVideoUrl) {
        return res.status(400).json({
          error: t('admin.lesson_n_title_url_required', req.lang, { n: String(i + 1) }),
        })
      }
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category || 'Général',
        level: level || 'Débutant',
        duration: duration || null,
        thumbnail: thumbnail || null,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        discountEndsAt: discountEndsAt ? new Date(discountEndsAt) : null,
        showSyllabus: showSyllabus !== undefined ? showSyllabus : true,
        isPublished: true,
        lessons: {
          create: lessons.map((l, i) => ({
            title: l.title.trim(),
            description: l.description?.trim() || null,
            externalVideoUrl: l.externalVideoUrl.trim(),
            duration: l.duration || null,
            order: i + 1,
          })),
        },
      },
      include: { lessons: { orderBy: { order: 'asc' } } },
    })

    console.log(JSON.stringify({
      event: 'COURSE_CREATED',
      courseId: course.id,
      title: course.title,
      lessonsCount: lessons.length,
      adminEmail: req.user.email,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    res.status(201).json({
      message: t('admin.course_created', req.lang, { title: course.title }),
      course,
    })
  } catch (err) { next(err) }
})

// PUT — Modifier formation
router.put('/courses/:id', async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const { title, description, price, category, level, duration, thumbnail, discountPrice, discountEndsAt, showSyllabus } = req.body

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ error: t('courses.not_found', req.lang) })

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title?.trim() || course.title,
        description: description?.trim() || course.description,
        price: price !== undefined ? parseFloat(price) : course.price,
        category: category || course.category,
        level: level || course.level,
        duration: duration !== undefined ? duration : course.duration,
        thumbnail: thumbnail !== undefined ? thumbnail : course.thumbnail,
        discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : course.discountPrice,
        discountEndsAt: discountEndsAt !== undefined ? (discountEndsAt ? new Date(discountEndsAt) : null) : course.discountEndsAt,
        showSyllabus: showSyllabus !== undefined ? showSyllabus : course.showSyllabus,
      },
      include: { lessons: { orderBy: { order: 'asc' } } },
    })

    res.json({
      message: t('admin.course_updated', req.lang, { title: updated.title }),
      course: updated,
    })
  } catch (err) { next(err) }
})

// PUT — Publier/Dépublier
router.put('/courses/:id/publish', async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ error: t('courses.not_found', req.lang) })

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: !course.isPublished },
    })

    res.json({
      message: updated.isPublished
        ? t('admin.course_published', req.lang, { title: updated.title })
        : t('admin.course_unpublished', req.lang, { title: updated.title }),
      isPublished: updated.isPublished,
    })
  } catch (err) { next(err) }
})

// DELETE — Supprimer formation
router.delete('/courses/:id', async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ error: t('courses.not_found', req.lang) })

    await prisma.course.delete({ where: { id: courseId } })

    console.log(JSON.stringify({
      event: 'COURSE_DELETED',
      courseId,
      title: course.title,
      adminEmail: req.user.email,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    res.json({ message: t('admin.course_deleted', req.lang, { title: course.title }) })
  } catch (err) { next(err) }
})

// ─── GESTION DES LEÇONS ──────────────────────────────────────

router.post('/courses/:id/lessons', async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const { title, description, externalVideoUrl, duration } = req.body

    if (!title || !externalVideoUrl)
      return res.status(400).json({ error: t('admin.lesson_title_url_required', req.lang) })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true },
    })
    if (!course) return res.status(404).json({ error: t('courses.not_found', req.lang) })

    const maxOrder = course.lessons.reduce((max, l) => Math.max(max, l.order), 0)

    const lesson = await prisma.lesson.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        externalVideoUrl: externalVideoUrl.trim(),
        duration: duration || null,
        order: maxOrder + 1,
        courseId,
      },
    })

    res.status(201).json({
      message: t('admin.lesson_added', req.lang, { title: lesson.title }),
      lesson,
    })
  } catch (err) { next(err) }
})

router.put('/lessons/:id', async (req, res, next) => {
  try {
    const lessonId = validateId(req.params.id)
    if (!lessonId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const { title, description, externalVideoUrl, duration, order } = req.body

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) return res.status(404).json({ error: t('video.lesson_not_found', req.lang) })

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: title?.trim() || lesson.title,
        description: description !== undefined ? (description?.trim() || null) : lesson.description,
        externalVideoUrl: externalVideoUrl?.trim() || lesson.externalVideoUrl,
        duration: duration !== undefined ? duration : lesson.duration,
        order: order !== undefined ? parseInt(order) : lesson.order,
      },
    })

    res.json({
      message: t('admin.lesson_updated', req.lang, { title: updated.title }),
      lesson: updated,
    })
  } catch (err) { next(err) }
})

router.delete('/lessons/:id', async (req, res, next) => {
  try {
    const lessonId = validateId(req.params.id)
    if (!lessonId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) return res.status(404).json({ error: t('video.lesson_not_found', req.lang) })

    await prisma.lesson.delete({ where: { id: lessonId } })

    res.json({ message: t('admin.lesson_deleted', req.lang, { title: lesson.title }) })
  } catch (err) { next(err) }
})

// ─── CONFIGURATION PLATEFORME ─────────────────────────────────
const { getSettings, updateSettings } = require('../settingsManager')

const introVideoDir = path.join(__dirname, '../uploads/intro')
if (!fs.existsSync(introVideoDir)) fs.mkdirSync(introVideoDir, { recursive: true })

const videoMimeToExt = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
}

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, introVideoDir),
  filename: (req, file, cb) => {
    const ext = videoMimeToExt[file.mimetype] || '.mp4'
    cb(null, 'intro-' + Date.now() + ext)
  },
})
const uploadVideoMulter = multer({
  storage: videoStorage,
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['video/mp4', 'video/webm', 'video/ogg'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Format non supporté. Utilisez MP4, WebM ou OGG.'))
  },
})

router.get('/config', (req, res, next) => {
  try {
    res.json(getSettings())
  } catch (err) { next(err) }
})

router.put('/config', (req, res, next) => {
  try {
    const updated = updateSettings(req.body)
    console.log(JSON.stringify({
      event: 'ADMIN_CONFIG_UPDATED',
      adminEmail: req.user.email,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))
    res.json({ message: t('admin.config_updated', req.lang), config: updated })
  } catch (err) { next(err) }
})

router.post('/upload-intro-video', uploadVideoMulter.single('video'), validateUploadContent('video'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: t('admin.no_video', req.lang) })
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    const videoUrl = `${backendUrl}/uploads/intro/${req.file.filename}`
    const updated = updateSettings({ introVideoUrl: videoUrl })
    res.json({ message: t('admin.intro_uploaded', req.lang), url: videoUrl, config: updated })
  } catch (err) { next(err) }
})

module.exports = router
