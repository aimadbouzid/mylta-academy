// ============================================================
// ROUTES ADMIN — Mylta Academy (Production-Ready)
// CRUD Formations + Leçons + Paiements + Stats
// Pagination, i18n, Atomic Stats
// ============================================================

const express = require('express')
const argon2 = require('argon2')
const prisma = require('../prisma')
const { z } = require('zod')
const { authenticate, isAdmin } = require('../middleware/auth')
const { t } = require('../i18n')
const { validateId } = require('../middleware/security')
const { validateUploadContent } = require('../middleware/uploadValidator')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { userSockets, guestSockets, getIO } = require('../socket')

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
    const [totalUsers, totalAccounts, studentsCount, instructorsCount, adminsCount, totalCourses, pendingReceipts, approvedAggregate, totalSalesCount, totalSubscribers] = await prisma.$transaction([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.course.count(),
      prisma.receipt.count({ where: { status: 'PENDING' } }),
      prisma.receipt.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.receipt.count({ where: { status: 'APPROVED' } }),
      prisma.newsletterSubscriber.count(),
    ])

    const totalRevenue = approvedAggregate._sum.amount || 0
    const onlineUsersCount = userSockets ? userSockets.size : 0
    const onlineGuestsCount = guestSockets ? guestSockets.size : 0
    const offlineUsersCount = Math.max(0, totalAccounts - onlineUsersCount)
    const currentTime = new Date().toISOString()

    res.json({
      totalUsers,
      totalAccounts,
      studentsCount,
      instructorsCount,
      adminsCount,
      onlineUsersCount,
      onlineGuestsCount,
      totalActiveVisitors: onlineUsersCount + onlineGuestsCount,
      offlineUsersCount,
      currentTime,
      totalCourses,
      pendingReceipts,
      totalRevenue,
      totalSales: totalSalesCount,
      totalSubscribers,
    })
  } catch (err) { next(err) }
})

// ─── STATISTIQUES DE PRÉSENCE EN DIRECT & CLICS (SÉCURISÉ & HARDENED) ───
router.get('/presence-stats', async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 100))
    const clickLimit = Math.min(1000, Math.max(10, parseInt(req.query.clickLimit, 10) || 60))

    const [totalAccounts, studentsCount, instructorsCount, adminsCount, usersList, totalClicksCount, recentClickLogs, topClickedRaw] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      prisma.clickLog.count(),
      prisma.clickLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: clickLimit
      }),
      prisma.clickLog.groupBy({
        by: ['elementText', 'pageUrl', 'elementTag'],
        where: { elementText: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 12
      })
    ])

    const onlineUserIdsSet = new Set()
    if (userSockets) {
      for (const [uId, socketSet] of userSockets.entries()) {
        if (socketSet && socketSet.size > 0) {
          onlineUserIdsSet.add(Number(uId))
        }
      }
    }

    const onlineUsersCount = onlineUserIdsSet.size
    const onlineGuestsCount = guestSockets ? guestSockets.size : 0
    const totalActiveVisitors = onlineUsersCount + onlineGuestsCount
    const offlineUsersCount = Math.max(0, totalAccounts - onlineUsersCount)

    const formattedUsers = usersList.map(u => {
      const isOnline = onlineUserIdsSet.has(Number(u.id))
      return {
        ...u,
        isOnline,
        createdAtFormatted: new Date(u.createdAt).toLocaleDateString('fr-DZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
    })

    const topClickedElements = topClickedRaw.map(item => ({
      elementText: item.elementText,
      pageUrl: item.pageUrl,
      elementTag: item.elementTag,
      count: item._count.id
    }))

    const currentTime = new Date().toISOString()
    const serverTimeFormatted = new Date().toLocaleDateString('fr-DZ', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    res.json({
      totalAccounts,
      studentsCount,
      instructorsCount,
      adminsCount,
      onlineUsersCount,
      onlineGuestsCount,
      totalActiveVisitors,
      offlineUsersCount,
      totalClicksCount,
      topClickedElements,
      recentClickLogs,
      currentTime,
      serverTimeFormatted,
      users: formattedUsers
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

    // Atomic update to prevent Race Condition (Double Payout / Referral)
    const updateResult = await prisma.receipt.updateMany({
      where: { id: receiptId, status: 'PENDING' },
      data: { status: 'APPROVED', approvedAt: new Date() },
    })

    if (updateResult.count === 0) {
      // It was either not found or already processed
      const receiptExists = await prisma.receipt.findUnique({ where: { id: receiptId } })
      if (!receiptExists) return res.status(404).json({ error: t('admin.receipt_not_found', req.lang) })
      return res.status(409).json({ error: t('admin.receipt_already_approved', req.lang) })
    }

    const updated = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        course: { select: { id: true, title: true, instructorId: true } },
      },
    })

    const receipt = updated

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

    // Credit instructor balance if this is an instructor's course
    if (updated.course.instructorId && receipt.instructorEarnings) {
      await prisma.user.update({
        where: { id: updated.course.instructorId },
        data: { instructorBalance: { increment: receipt.instructorEarnings } },
      })
    }

    // Incrémenter le coupon si appliqué
    if (receipt.couponId) {
      await prisma.coupon.updateMany({
        where: { id: receipt.couponId },
        data: { currentUses: { increment: 1 } },
      })
    }
    
    // Notification temps réel (WebSocket)
    try {
      getIO().to(`user_${updated.user.id}`).emit('receipt_approved', { 
        receiptId, 
        courseTitle: updated.course.title 
      });
    } catch (err) {
      console.error('Socket error on approval', err);
    }

    console.log(JSON.stringify({
      event: 'RECEIPT_APPROVED',
      receiptId,
      adminEmail: req.user.email,
      userId: updated.user.id,
      courseTitle: updated.course.title,
      instructorEarnings: receipt.instructorEarnings,
      platformCommission: receipt.platformCommission,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    // Supprimer l'image du reçu une fois validé pour ne pas alourdir le serveur
    if (receipt.receiptImage) {
      const fs = require('fs')
      const path = require('path')
      const filename = path.basename(receipt.receiptImage)
      const filePath = path.join(__dirname, '../uploads/receipts', filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { receiptImage: null, notes: receipt.notes ? receipt.notes + ' (Image purgée après validation)' : 'Image purgée après validation' }
      })
      updated.receiptImage = null
    }

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
    // Chemin relatif : voir la note dans routes/instructor.js — une URL absolue
    // fige l'hôte/le port dans la base et casse les images au moindre changement.
    res.json({ url: `/uploads/thumbnails/${req.file.filename}` })
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

// ─── COACHING EN LIGNE : RÉSERVATIONS ─────────────────────────
router.get('/coaching-bookings', async (req, res, next) => {
  try {
    const bookings = await prisma.coachingBooking.findMany({
      orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
      take: 500,
    })
    res.json(bookings)
  } catch (err) { next(err) }
})

router.put('/coaching-bookings/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID invalide.' })
    const { status } = req.body
    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide.' })
    }
    const booking = await prisma.coachingBooking.update({
      where: { id },
      data: { status },
    })
    res.json(booking)
  } catch (err) { next(err) }
})

router.delete('/coaching-bookings/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID invalide.' })
    await prisma.coachingBooking.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── COACHING PRÉSENTIEL : SESSIONS & INSCRIPTIONS ────────────
const sessionSchema = z.object({
  title: z.string().trim().max(120).optional().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^(\d{2}:\d{2})?$/).optional().default(''),
  endTime: z.string().regex(/^(\d{2}:\d{2})?$/).optional().default(''),
  city: z.string().trim().max(60).optional().default(''),
  place: z.string().trim().max(200).optional().default(''),
  capacity: z.coerce.number().int().min(1).max(500),
  price: z.coerce.number().int().min(0).max(10000000).optional().default(0),
  isOpen: z.boolean().optional().default(true),
})

router.get('/in-person', async (req, res, next) => {
  try {
    const [sessions, waitlist] = await Promise.all([
      prisma.inPersonSession.findMany({
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        include: { registrations: { orderBy: { createdAt: 'asc' } } },
      }),
      prisma.inPersonRegistration.findMany({ where: { sessionId: null }, orderBy: { createdAt: 'desc' } }),
    ])
    res.json({ sessions, waitlist })
  } catch (err) { next(err) }
})

router.post('/in-person/sessions', async (req, res, next) => {
  try {
    const parsed = sessionSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Vérifiez la date et le nombre de places.' })
    res.status(201).json(await prisma.inPersonSession.create({ data: parsed.data }))
  } catch (err) { next(err) }
})

router.put('/in-person/sessions/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID invalide.' })
    const parsed = sessionSchema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Vérifiez la date et le nombre de places.' })
    res.json(await prisma.inPersonSession.update({ where: { id }, data: parsed.data }))
  } catch (err) { next(err) }
})

// Supprimer une session renvoie ses inscrits en liste d'attente (onDelete: SetNull)
router.delete('/in-person/sessions/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID invalide.' })
    await prisma.inPersonSession.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.put('/in-person/registrations/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID invalide.' })
    const { status, sessionId } = req.body
    const data = {}
    if (status !== undefined) {
      if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) return res.status(400).json({ error: 'Statut invalide.' })
      data.status = status
    }
    if (sessionId !== undefined) data.sessionId = sessionId === null ? null : validateId(sessionId)
    res.json(await prisma.inPersonRegistration.update({ where: { id }, data }))
  } catch (err) { next(err) }
})

router.delete('/in-person/registrations/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID invalide.' })
    await prisma.inPersonRegistration.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// Crée l'accès plateforme d'un inscrit (identifiant = téléphone, mot de passe généré, montré une seule fois).
router.post('/in-person/registrations/:id/account', async (req, res, next) => {
  try {
    const id = validateId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID invalide.' })
    const reg = await prisma.inPersonRegistration.findUnique({ where: { id } })
    if (!reg) return res.status(404).json({ error: 'Inscription introuvable.' })
    const { createPhoneAccount, AccountExistsError } = require('../utils/phoneAccount')
    try {
      res.status(201).json({ account: await createPhoneAccount({ fullName: reg.fullName, phone: reg.phone }) })
    } catch (err) {
      if (err instanceof AccountExistsError) return res.status(409).json({ error: 'Cette personne a déjà un compte (même numéro).' })
      throw err
    }
  } catch (err) { next(err) }
})

// ─── Concours ─────────────────────────────────────────────────
router.get('/contest/entries', async (req, res, next) => {
  try {
    res.json({ entries: await prisma.contestEntry.findMany({ orderBy: { createdAt: 'desc' } }) })
  } catch (err) { next(err) }
})

router.delete('/contest/entries/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID invalide.' })
    await prisma.contestEntry.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// Nouveau code secret pour le QR d'inscription sur place (l'ancien QR cesse de marcher).
router.post('/in-person/join-code', (req, res) => {
  const { updateSettings } = require('../settingsManager')
  const joinCode = req.body?.disable ? '' : require('crypto').randomBytes(12).toString('base64url')
  updateSettings({ inPerson: { joinCode } })
  res.json({ joinCode })
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
    // Chemin relatif : même raison que pour les miniatures.
    const videoUrl = `/uploads/intro/${req.file.filename}`
    const updated = updateSettings({ introVideoUrl: videoUrl })
    res.json({ message: t('admin.intro_uploaded', req.lang), url: videoUrl, config: updated })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════
// MARKETPLACE — GESTION DES FORMATEURS
// ═══════════════════════════════════════════════════════════════

// ─── GET /api/admin/instructor-applications — Candidatures ───
router.get('/instructor-applications', async (req, res, next) => {
  try {
    const status = req.query.status || 'PENDING'
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED']
    const where = validStatuses.includes(status) ? { status } : {}

    const applications = await prisma.instructorApplication.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ applications })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/instructor-applications/:id/approve ──────
router.put('/instructor-applications/:id/approve', async (req, res, next) => {
  try {
    const appId = validateId(req.params.id)
    if (!appId) return res.status(400).json({ error: 'ID invalide.' })

    const application = await prisma.instructorApplication.findUnique({
      where: { id: appId },
      include: { user: { select: { id: true, email: true, name: true } } },
    })
    if (!application) return res.status(404).json({ error: 'Candidature introuvable.' })
    if (application.status === 'APPROVED') return res.status(409).json({ error: 'Déjà approuvée.' })

    const { commissionRate } = req.body

    await prisma.$transaction([
      prisma.instructorApplication.update({
        where: { id: appId },
        data: { status: 'APPROVED', adminNotes: req.body.adminNotes || null },
      }),
      prisma.user.update({
        where: { id: application.userId },
        data: {
          role: 'INSTRUCTOR',
          instructorApproved: true,
          commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        },
      }),
      prisma.notification.create({
        data: {
          userId: application.userId,
          title: '🎉 Candidature Formateur Approuvée !',
          message: 'Votre candidature a été approuvée ! Vous pouvez maintenant créer et vendre vos formations.',
          type: 'SUCCESS',
        },
      }),
    ])

    console.log(JSON.stringify({
      event: 'INSTRUCTOR_APPLICATION_APPROVED',
      applicationId: appId,
      userId: application.userId,
      adminEmail: req.user.email,
      timestamp: new Date().toISOString(),
    }))

    res.json({ message: `${application.user.name || application.user.email} est maintenant formateur.` })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/instructor-applications/:id/reject ───────
router.put('/instructor-applications/:id/reject', async (req, res, next) => {
  try {
    const appId = validateId(req.params.id)
    if (!appId) return res.status(400).json({ error: 'ID invalide.' })

    const application = await prisma.instructorApplication.findUnique({
      where: { id: appId },
      include: { user: { select: { id: true, email: true, name: true } } },
    })
    if (!application) return res.status(404).json({ error: 'Candidature introuvable.' })

    const reason = req.body.reason || 'Candidature non retenue.'

    await prisma.$transaction([
      prisma.instructorApplication.update({
        where: { id: appId },
        data: { status: 'REJECTED', adminNotes: reason },
      }),
      prisma.notification.create({
        data: {
          userId: application.userId,
          title: 'Candidature Formateur',
          message: `Votre candidature n'a pas été retenue. Raison: ${reason}`,
          type: 'WARNING',
        },
      }),
    ])

    res.json({ message: 'Candidature rejetée.' })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/instructors — Liste des formateurs ───────
router.get('/instructors', async (req, res, next) => {
  try {
    const instructors = await prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      select: {
        id: true, email: true, name: true, instructorBio: true,
        instructorApproved: true, instructorBalance: true,
        commissionRate: true, createdAt: true,
        _count: { select: { coursesCreated: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ instructors })
  } catch (err) { next(err) }
})

// ─── POST /api/admin/instructors — Créer un formateur ───────
router.post('/instructors', async (req, res, next) => {
  try {
    const { name, email, password, commissionRate, plan } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom sont requis.' })
    }

    const hashed = await argon2.hash(password)
    const commission = commissionRate ? parseFloat(commissionRate) : 20

    let user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà. Impossible d\'écraser un compte existant.' })
    } else {
      // Calcul de la date d'expiration (+30 jours)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: 'INSTRUCTOR',
          instructorApproved: true,
          commissionRate: commission,
          instructorPlan: plan || 'Starter',
          instructorPlanExpiresAt: expiresAt
        }
      })

      // Création de la notification de bienvenue et instructions de paiement
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Bienvenue en tant que formateur !',
          message: `Votre compte a été configuré avec l'offre ${plan || 'Starter'} (valable jusqu'au ${expiresAt.toLocaleDateString('fr-DZ')}).\n\nMéthodes de paiement exigées pour votre abonnement :\n- Prioritaire : Baridimob ou Carte Visa Redotpay\n- Secondaire : CCP\n\nVeuillez régler votre abonnement mensuel à temps pour éviter toute interruption.`,
          type: 'INFO'
        }
      })
    }

    res.json({ message: 'Formateur créé avec succès.', user: { id: user.id, email: user.email, name: user.name, plan: user.instructorPlan, expiresAt: user.instructorPlanExpiresAt } })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/instructors/:id/commission — Modifier commission
router.put('/instructors/:id/commission', async (req, res, next) => {
  try {
    const userId = validateId(req.params.id)
    if (!userId) return res.status(400).json({ error: 'ID invalide.' })

    const { commissionRate } = req.body
    if (commissionRate === undefined || isNaN(parseFloat(commissionRate)) || parseFloat(commissionRate) < 0 || parseFloat(commissionRate) > 100) {
      return res.status(400).json({ error: 'Taux de commission invalide (0-100).' })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { commissionRate: parseFloat(commissionRate) },
    })

    res.json({ message: `Commission mise à jour: ${commissionRate}%` })
  } catch (err) { next(err) }
})

// ─── DELETE /api/admin/instructors/:id — Supprimer un formateur
// Le solde doit être à 0 (payer le retrait avant suppression).
// Les formations déjà vendues sont rattachées à la plateforme
// pour que les étudiants gardent leur accès ; celles sans vente
// sont supprimées. Les articles de blog passent à l'admin.
router.delete('/instructors/:id', async (req, res, next) => {
  try {
    const userId = validateId(req.params.id)
    if (!userId) return res.status(400).json({ error: 'ID invalide.' })

    const instructor = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, instructorBalance: true },
    })
    if (!instructor) return res.status(404).json({ error: 'Formateur introuvable.' })
    if (instructor.role !== 'INSTRUCTOR') {
      return res.status(400).json({ error: 'Cet utilisateur n\'est pas un formateur.' })
    }
    if (instructor.id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' })
    }
    if ((instructor.instructorBalance || 0) > 0) {
      return res.status(409).json({
        error: `Ce formateur a un solde de ${instructor.instructorBalance.toLocaleString('fr-DZ')} DZD. Réglez le retrait avant de supprimer le compte.`,
      })
    }

    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      select: { id: true, title: true, _count: { select: { receipts: true } } },
    })
    const soldCourseIds = courses.filter(c => c._count.receipts > 0).map(c => c.id)
    const unsoldCourseIds = courses.filter(c => c._count.receipts === 0).map(c => c.id)

    await prisma.$transaction([
      // Formations vendues → rattachées à la plateforme (accès étudiants préservé)
      prisma.course.updateMany({
        where: { id: { in: soldCourseIds } },
        data: { instructorId: null, approvedByAdmin: true },
      }),
      // Formations sans vente → supprimées (leçons/ressources en cascade)
      prisma.course.deleteMany({ where: { id: { in: unsoldCourseIds } } }),
      // Articles de blog → transférés à l'admin qui supprime
      prisma.blogPost.updateMany({ where: { authorId: userId }, data: { authorId: req.user.id } }),
      // Parrainages → détachés
      prisma.user.updateMany({ where: { referredById: userId }, data: { referredById: null } }),
      // Achats effectués par ce compte (pas de cascade en base)
      prisma.receipt.deleteMany({ where: { userId } }),
      // Notifications, avis, progression, candidatures, retraits et sessions
      // sont supprimés en cascade par Prisma.
      prisma.user.delete({ where: { id: userId } }),
    ])

    console.log(JSON.stringify({
      event: 'INSTRUCTOR_DELETED',
      instructorId: userId,
      instructorEmail: instructor.email,
      coursesDetached: soldCourseIds.length,
      coursesDeleted: unsoldCourseIds.length,
      adminEmail: req.user.email,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    res.json({
      message: `Formateur ${instructor.name || instructor.email} supprimé.`,
      coursesDetached: soldCourseIds.length,
      coursesDeleted: unsoldCourseIds.length,
    })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/instructor-courses — Formations à modérer ─
router.get('/instructor-courses', async (req, res, next) => {
  try {
    const approved = req.query.approved
    const where = { instructorId: { not: null } }

    if (approved === 'false') where.approvedByAdmin = false
    else if (approved === 'true') where.approvedByAdmin = true

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { lessons: true, receipts: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ courses })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/instructor-courses/:id/approve ───────────
router.put('/instructor-courses/:id/approve', async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: 'ID invalide.' })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: { select: { id: true, name: true } } },
    })
    if (!course) return res.status(404).json({ error: 'Formation introuvable.' })

    await prisma.$transaction([
      prisma.course.update({
        where: { id: courseId },
        data: { approvedByAdmin: true, isPublished: true },
      }),
      prisma.notification.create({
        data: {
          userId: course.instructorId,
          title: '✅ Formation Approuvée',
          message: `Votre formation "${course.title}" a été approuvée et publiée !`,
          type: 'SUCCESS',
        },
      }),
    ])

    res.json({ message: `Formation "${course.title}" approuvée et publiée.` })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/instructor-courses/:id/reject ────────────
router.put('/instructor-courses/:id/reject', async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: 'ID invalide.' })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: { select: { id: true } } },
    })
    if (!course) return res.status(404).json({ error: 'Formation introuvable.' })

    const reason = req.body.reason || 'La formation ne respecte pas nos critères.'

    await prisma.$transaction([
      prisma.course.update({
        where: { id: courseId },
        data: { approvedByAdmin: false, isPublished: false },
      }),
      prisma.notification.create({
        data: {
          userId: course.instructorId,
          title: '❌ Formation Refusée',
          message: `Votre formation "${course.title}" n'a pas été approuvée. Raison: ${reason}`,
          type: 'WARNING',
        },
      }),
    ])

    res.json({ message: 'Formation refusée.' })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/marketplace-stats — Stats marketplace ────
router.get('/marketplace-stats', async (req, res, next) => {
  try {
    const [
      totalInstructors,
      pendingApplications,
      instructorCourses,
      pendingModeration,
      platformCommission,
      instructorEarnings,
      pendingPayouts,
      completedPayouts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.instructorApplication.count({ where: { status: 'PENDING' } }),
      prisma.course.count({ where: { instructorId: { not: null } } }),
      prisma.course.count({ where: { instructorId: { not: null }, approvedByAdmin: false } }),
      prisma.receipt.aggregate({
        where: { status: 'APPROVED', platformCommission: { not: null } },
        _sum: { platformCommission: true },
      }),
      prisma.receipt.aggregate({
        where: { status: 'APPROVED', instructorEarnings: { not: null } },
        _sum: { instructorEarnings: true },
      }),
      prisma.instructorPayout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.instructorPayout.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ])

    res.json({
      totalInstructors,
      pendingApplications,
      instructorCourses,
      pendingModeration,
      platformCommission: platformCommission._sum.platformCommission || 0,
      instructorEarnings: instructorEarnings._sum.instructorEarnings || 0,
      pendingPayouts: {
        count: pendingPayouts._count || 0,
        amount: pendingPayouts._sum.amount || 0,
      },
      completedPayouts: completedPayouts._sum.amount || 0,
    })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/payouts — Demandes de retrait ────────────
router.get('/payouts', async (req, res, next) => {
  try {
    const status = req.query.status || 'PENDING'
    const where = ['PENDING', 'COMPLETED', 'REJECTED'].includes(status) ? { status } : {}

    const payouts = await prisma.instructorPayout.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, email: true, instructorBalance: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ payouts })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/payouts/:id/complete — Valider retrait ──
router.put('/payouts/:id/complete', async (req, res, next) => {
  try {
    const payoutId = validateId(req.params.id)
    if (!payoutId) return res.status(400).json({ error: 'ID invalide.' })

    const payout = await prisma.instructorPayout.findUnique({ where: { id: payoutId } })
    if (!payout) return res.status(404).json({ error: 'Retrait introuvable.' })
    // Seule une demande PENDING peut être validée (une demande rejetée a déjà
    // été remboursée : la valider verserait un montant déjà rendu au solde).
    if (payout.status !== 'PENDING') {
      return res.status(409).json({ error: `Cette demande est déjà traitée (${payout.status}).` })
    }

    // updateMany conditionné au statut : si deux admins valident en même temps,
    // le second obtient count 0 au lieu d'un double versement.
    const [updated] = await prisma.$transaction([
      prisma.instructorPayout.updateMany({
        where: { id: payoutId, status: 'PENDING' },
        data: {
          status: 'COMPLETED',
          notes: req.body.notes || null,
          processedAt: new Date(),
          processedBy: req.user.email,
        },
      }),
      prisma.notification.create({
        data: {
          userId: payout.instructorId,
          title: '💰 Retrait Effectué',
          message: `Votre retrait de ${payout.amount} DA (réf. ${payout.reference}) a été traité avec succès.`,
          type: 'SUCCESS',
        },
      }),
    ])

    if (updated.count === 0) {
      return res.status(409).json({ error: 'Cette demande vient d\'être traitée par un autre administrateur.' })
    }

    console.log(JSON.stringify({
      event: 'PAYOUT_COMPLETED',
      payoutId,
      reference: payout.reference,
      instructorId: payout.instructorId,
      amount: payout.amount,
      adminEmail: req.user.email,
      timestamp: new Date().toISOString(),
    }))

    res.json({ message: 'Retrait validé.' })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/payouts/:id/reject — Rejeter retrait ────
router.put('/payouts/:id/reject', async (req, res, next) => {
  try {
    const payoutId = validateId(req.params.id)
    if (!payoutId) return res.status(400).json({ error: 'ID invalide.' })

    const payout = await prisma.instructorPayout.findUnique({ where: { id: payoutId } })
    if (!payout) return res.status(404).json({ error: 'Retrait introuvable.' })

    // Garde-fou indispensable : sans ce contrôle, un second rejet recréditerait
    // le solde une deuxième fois, et rejeter un retrait COMPLETED rendrait au
    // formateur un montant qui lui a déjà été versé.
    if (payout.status !== 'PENDING') {
      return res.status(409).json({
        error: payout.status === 'COMPLETED'
          ? 'Ce retrait a déjà été payé et ne peut plus être rejeté.'
          : 'Cette demande a déjà été rejetée.',
      })
    }

    // Garde atomique : ce updateMany conditionné au statut PENDING doit
    // s'exécuter et être vérifié AVANT tout effet de bord — un $transaction
    // en forme de tableau exécute ses opérations inconditionnellement (elles
    // ne sont pas liées entre elles), donc deux rejets simultanés créditaient
    // le solde deux fois avant ce correctif.
    const updated = await prisma.instructorPayout.updateMany({
      where: { id: payoutId, status: 'PENDING' },
      data: {
        status: 'REJECTED',
        notes: req.body.reason || 'Retrait rejeté.',
        processedAt: new Date(),
        processedBy: req.user.email,
      },
    })

    if (updated.count === 0) {
      return res.status(409).json({ error: 'Cette demande vient d\'être traitée par un autre administrateur.' })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: payout.instructorId },
        data: { instructorBalance: { increment: payout.amount } },
      }),
      prisma.notification.create({
        data: {
          userId: payout.instructorId,
          title: 'Retrait Rejeté',
          message: `Votre demande de retrait de ${payout.amount} DA (réf. ${payout.reference}) a été rejetée. Le montant a été remis dans votre solde.`,
          type: 'WARNING',
        },
      }),
    ])

    console.log(JSON.stringify({
      event: 'PAYOUT_REJECTED',
      payoutId,
      reference: payout.reference,
      instructorId: payout.instructorId,
      amount: payout.amount,
      adminEmail: req.user.email,
      timestamp: new Date().toISOString(),
    }))

    res.json({ message: 'Retrait rejeté, solde remboursé.' })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════
// VÉRIFICATION D'IDENTITÉ DES FORMATEURS (préalable aux retraits)
// ═══════════════════════════════════════════════════════════════

// ─── GET /api/admin/identities — Dossiers d'identité ─────────
router.get('/identities', async (req, res, next) => {
  try {
    const status = req.query.status || 'PENDING'
    const where = ['NONE', 'PENDING', 'VERIFIED', 'REJECTED'].includes(status)
      ? { identityStatus: status }
      : {}

    const instructors = await prisma.user.findMany({
      where: { ...where, instructorApproved: true },
      select: {
        id: true, name: true, email: true, instructorBalance: true,
        identityStatus: true, identityFullName: true, identityDocPath: true,
        identitySubmittedAt: true, identityVerifiedAt: true,
        identityVerifiedBy: true, identityNotes: true,
      },
      orderBy: { identitySubmittedAt: 'desc' },
    })

    res.json({ instructors })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/identities/:id/verify — Valider identité ─
router.put('/identities/:id/verify', async (req, res, next) => {
  try {
    const userId = validateId(req.params.id)
    if (!userId) return res.status(400).json({ error: 'ID invalide.' })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, identityStatus: true, identityDocPath: true, identityFullName: true },
    })
    if (!user) return res.status(404).json({ error: 'Formateur introuvable.' })
    if (user.identityStatus === 'VERIFIED') {
      return res.status(409).json({ error: 'Identité déjà vérifiée.' })
    }
    // On ne valide pas une identité sans pièce fournie : la validation engage
    // la plateforme sur l'identité du bénéficiaire des versements.
    if (!user.identityDocPath) {
      return res.status(400).json({ error: 'Aucun document d\'identité fourni par ce formateur.' })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          identityStatus: 'VERIFIED',
          identityVerifiedAt: new Date(),
          identityVerifiedBy: req.user.email,
          identityNotes: req.body.notes || null,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          title: '✅ Identité vérifiée',
          message: 'Votre identité a été validée. Vous pouvez désormais demander un retrait.',
          type: 'SUCCESS',
        },
      }),
    ])

    console.log(JSON.stringify({
      event: 'IDENTITY_VERIFIED',
      userId,
      legalName: user.identityFullName,
      adminEmail: req.user.email,
      timestamp: new Date().toISOString(),
    }))

    res.json({ message: 'Identité vérifiée.' })
  } catch (err) { next(err) }
})

// ─── PUT /api/admin/identities/:id/reject — Refuser identité ─
router.put('/identities/:id/reject', async (req, res, next) => {
  try {
    const userId = validateId(req.params.id)
    if (!userId) return res.status(400).json({ error: 'ID invalide.' })

    const reason = (req.body.reason || '').trim()
    if (!reason) {
      return res.status(400).json({ error: 'Un motif est requis pour refuser une identité.' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, identityStatus: true },
    })
    if (!user) return res.status(404).json({ error: 'Formateur introuvable.' })

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          identityStatus: 'REJECTED',
          identityNotes: reason,
          identityVerifiedAt: null,
          identityVerifiedBy: req.user.email,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          title: 'Identité refusée',
          message: `Votre vérification d'identité a été refusée : ${reason}. Vous pouvez soumettre un nouveau document.`,
          type: 'WARNING',
        },
      }),
    ])

    console.log(JSON.stringify({
      event: 'IDENTITY_REJECTED',
      userId,
      adminEmail: req.user.email,
      timestamp: new Date().toISOString(),
    }))

    res.json({ message: 'Identité refusée.' })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/newsletter/subscribers — Obtenir les abonnés newsletter ────
router.get('/newsletter/subscribers', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10)
    const limit = parseInt(req.query.limit || '50', 10)
    const skip = (page - 1) * limit

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count(),
    ])

    res.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) { next(err) }
})

// ─── GET /api/admin/users/students — Lister les étudiants ────────────
router.get('/users/students', async (req, res, next) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    })
    res.json(students)
  } catch (err) { next(err) }
})

// ─── GET /api/admin/coupons — Lister les coupons ────────────
router.get('/coupons', async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(coupons)
  } catch (err) { next(err) }
})

// ─── POST /api/admin/coupons — Créer un coupon ────────────
router.post('/coupons', async (req, res, next) => {
  try {
    const { code, discountPercent, maxUses, expiresAt } = req.body
    
    if (!code || !discountPercent) {
      return res.status(400).json({ error: 'Code et pourcentage requis.' })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountPercent: parseFloat(discountPercent),
        maxUses: parseInt(maxUses) || 100,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    })
    res.status(201).json(coupon)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Ce code existe déjà.' })
    next(err)
  }
})

// ─── PUT /api/admin/coupons/:id — Modifier un coupon ────────────
router.put('/coupons/:id', async (req, res, next) => {
  try {
    const { isActive } = req.body
    const couponId = validateId(req.params.id)
    if (!couponId) return res.status(400).json({ error: 'ID invalide' })

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive }
    })
    res.json(updated)
  } catch (err) { next(err) }
})

module.exports = router
