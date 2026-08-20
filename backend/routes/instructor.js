// ============================================================
// ROUTES INSTRUCTOR — Mylta Academy (Marketplace)
// Candidature, Dashboard, CRUD Formations/Leçons, Revenus, Retraits
// ============================================================

const express = require('express')
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const prisma = require('../prisma')
const { authenticate } = require('../middleware/auth')
const { isInstructor, isInstructorApproved } = require('../middleware/isInstructor')
const { t } = require('../i18n')
const { validateId } = require('../middleware/security')
const { validateUploadContent } = require('../middleware/uploadValidator')
const { getSettings } = require('../settingsManager')
const { buildCourseQuota } = require('../utils/instructorLimits')

const router = express.Router()

// ─── Configuration Multer pour reçu de paiement (candidature) ─
const receiptDir = path.join(__dirname, '../uploads/receipts')
if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true })

const mimeToExt = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/pjpeg': '.jpg',
  'image/png': '.png', 'image/x-png': '.png',
  'image/webp': '.webp', 'image/gif': '.gif',
}

const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, receiptDir),
  filename: (req, file, cb) => {
    const uid = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`
    const ext = mimeToExt[file.mimetype?.toLowerCase()] || '.bin'
    cb(null, `instructor-receipt-${uid}${ext}`)
  },
})
const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype?.toLowerCase())) cb(null, true)
    else cb(new Error('Format de fichier non supporté.'))
  },
})

// ─── Configuration Multer pour pièce d'identité (retraits) ────
// Dossier séparé des reçus : ces pièces sont plus sensibles et ne doivent
// jamais être servies publiquement (voir la route de consultation admin).
const identityDir = path.join(__dirname, '../uploads/identities')
if (!fs.existsSync(identityDir)) fs.mkdirSync(identityDir, { recursive: true })

const identityStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, identityDir),
  filename: (req, file, cb) => {
    const uid = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`
    const ext = mimeToExt[file.mimetype?.toLowerCase()] || '.bin'
    cb(null, `identity-${uid}${ext}`)
  },
})
const uploadIdentity = multer({
  storage: identityStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/webp']
    if (allowed.includes(file.mimetype?.toLowerCase())) cb(null, true)
    else cb(new Error('Format non supporté (JPG, PNG ou WEBP).'))
  },
})

// ─── Configuration Multer pour thumbnails formateur ───────────
const thumbDir = path.join(__dirname, '../uploads/thumbnails')
if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true })

const thumbStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, thumbDir),
  filename: (req, file, cb) => {
    const uid = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const ext = mimeToExt[file.mimetype?.toLowerCase()] || '.bin'
    cb(null, `thumb-${uid}${ext}`)
  },
})
const uploadThumb = multer({
  storage: thumbStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Format non supporté.'))
  },
})

// ═══════════════════════════════════════════════════════════════
// CANDIDATURE FORMATEUR
// ═══════════════════════════════════════════════════════════════

// ─── POST /api/instructor/apply — Soumettre une candidature ──
router.post('/apply', authenticate, uploadReceipt.single('receiptImage'), validateUploadContent('receiptImage'), async (req, res, next) => {
  try {
    const userId = req.user.id
    const { message, specialty } = req.body

    // Vérifier si déjà formateur
    if (req.user.role === 'INSTRUCTOR') {
      return res.status(409).json({ error: 'Vous êtes déjà formateur.' })
    }

    if (req.user.role === 'ADMIN') {
      return res.status(400).json({ error: 'Les administrateurs n\'ont pas besoin de candidater.' })
    }

    // Vérifier candidature existante en attente
    const existing = await prisma.instructorApplication.findFirst({
      where: { userId, status: 'PENDING' },
    })
    if (existing) {
      return res.status(409).json({
        error: 'Vous avez déjà une candidature en attente.',
        application: { id: existing.id, status: existing.status, createdAt: existing.createdAt },
      })
    }

    const settings = getSettings()
    const spotPrice = settings.marketplace?.instructorSpotPrice || 5000

    const application = await prisma.instructorApplication.create({
      data: {
        userId,
        message: message?.trim() || null,
        specialty: specialty?.trim() || null,
        receiptId: null, // Si c'est lié à la table Receipt (actuellement non utilisé pour ça)
        receiptImage: req.file ? `/uploads/receipts/${req.file.filename}` : null,
      },
    })

    // Mettre à jour la date de candidature
    await prisma.user.update({
      where: { id: userId },
      data: { instructorAppliedAt: new Date() },
    })

    console.log(JSON.stringify({
      event: 'INSTRUCTOR_APPLICATION_SUBMITTED',
      userId,
      applicationId: application.id,
      hasReceipt: !!req.file,
      timestamp: new Date().toISOString(),
    }))

    res.status(201).json({
      message: 'Candidature soumise avec succès ! L\'admin va examiner votre demande.',
      application: {
        id: application.id,
        status: application.status,
        spotPrice,
        createdAt: application.createdAt,
      },
    })
  } catch (err) { next(err) }
})

// ─── GET /api/instructor/status — Statut de candidature ──────
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id

    const application = await prisma.instructorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, instructorApproved: true, instructorBio: true },
    })

    const settings = getSettings()

    res.json({
      isInstructor: user.role === 'INSTRUCTOR',
      isApproved: user.instructorApproved,
      application: application || null,
      spotPrice: settings.marketplace?.instructorSpotPrice || 5000,
    })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════
// DASHBOARD FORMATEUR (protégé)
// ═══════════════════════════════════════════════════════════════

// ─── GET /api/instructor/dashboard — Stats formateur ─────────
router.get('/dashboard', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const instructorId = req.user.id

    const [
      totalCourses,
      publishedCourses,
      pendingCourses,
      totalSales,
      totalEarnings,
      instructor,
      recentSales,
    ] = await Promise.all([
      prisma.course.count({ where: { instructorId } }),
      prisma.course.count({ where: { instructorId, isPublished: true, approvedByAdmin: true } }),
      prisma.course.count({ where: { instructorId, approvedByAdmin: false } }),
      prisma.receipt.count({
        where: { course: { instructorId }, status: 'APPROVED' },
      }),
      prisma.receipt.aggregate({
        where: { course: { instructorId }, status: 'APPROVED' },
        _sum: { instructorEarnings: true },
      }),
      prisma.user.findUnique({
        where: { id: instructorId },
        select: { instructorBalance: true, commissionRate: true, instructorPlan: true },
      }),
      prisma.receipt.findMany({
        where: { course: { instructorId }, status: 'APPROVED' },
        include: {
          course: { select: { title: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    const settings = getSettings()
    const commissionRate = instructor.commissionRate || settings.marketplace?.defaultCommissionRate || 20

    res.json({
      stats: {
        totalCourses,
        publishedCourses,
        pendingCourses,
        totalSales,
        totalEarnings: totalEarnings._sum.instructorEarnings || 0,
        balance: instructor.instructorBalance || 0,
        commissionRate,
      },
      quota: buildCourseQuota(instructor, totalCourses),
      recentSales,
    })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════
// CRUD FORMATIONS FORMATEUR
// ═══════════════════════════════════════════════════════════════

// ─── GET /api/instructor/courses — Mes formations ────────────
router.get('/courses', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const instructorId = req.user.id
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId },
        include: {
          lessons: { orderBy: { order: 'asc' } },
          _count: { select: { receipts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where: { instructorId } }),
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

// ─── POST /api/instructor/courses — Créer une formation ──────
router.post('/courses', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const instructorId = req.user.id
    const { title, description, price, category, level, duration, lessons = [], thumbnail, discountPrice, discountEndsAt, showSyllabus } = req.body

    // Quota de formations lié à l'offre — vérifié serveur, l'UI n'est qu'indicative
    const [instructor, coursesUsed] = await Promise.all([
      prisma.user.findUnique({ where: { id: instructorId }, select: { instructorPlan: true } }),
      prisma.course.count({ where: { instructorId } }),
    ])
    const quota = buildCourseQuota(instructor, coursesUsed)
    if (quota.reached) {
      return res.status(403).json({
        error: `Limite atteinte : votre offre ${quota.plan || 'actuelle'} autorise ${quota.limit} formation(s). Supprimez-en une ou passez à une offre supérieure.`,
        code: 'COURSE_LIMIT_REACHED',
        quota,
      })
    }

    if (!title || !description || price === undefined)
      return res.status(400).json({ error: 'Titre, description et prix sont requis.' })
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0)
      return res.status(400).json({ error: 'Le prix doit être un nombre positif.' })

    for (const [i, lesson] of lessons.entries()) {
      if (!lesson.title || !lesson.externalVideoUrl) {
        return res.status(400).json({
          error: `Leçon ${i + 1}: titre et URL vidéo requis.`,
        })
      }
    }

    const settings = getSettings()
    const autoApprove = settings.marketplace?.autoApproveCourses || false

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
        isPublished: autoApprove, // Only publish if auto-approved
        approvedByAdmin: autoApprove,
        instructorId,
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
      event: 'INSTRUCTOR_COURSE_CREATED',
      courseId: course.id,
      instructorId,
      title: course.title,
      autoApproved: autoApprove,
      timestamp: new Date().toISOString(),
    }))

    res.status(201).json({
      message: autoApprove
        ? 'Formation créée et publiée avec succès !'
        : 'Formation créée ! En attente d\'approbation par l\'admin.',
      course,
    })
  } catch (err) { next(err) }
})

// ─── PUT /api/instructor/courses/:id — Modifier ma formation ─
router.put('/courses/:id', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: 'ID invalide.' })

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ error: 'Formation introuvable.' })

    // Vérifier la propriété
    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres formations.' })
    }

    const { title, description, price, category, level, duration, thumbnail, discountPrice, discountEndsAt, showSyllabus } = req.body

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

    res.json({ message: 'Formation modifiée avec succès.', course: updated })
  } catch (err) { next(err) }
})

// ─── DELETE /api/instructor/courses/:id — Supprimer ──────────
router.delete('/courses/:id', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: 'ID invalide.' })

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ error: 'Formation introuvable.' })

    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres formations.' })
    }

    // Vérifier s'il y a des ventes
    const salesCount = await prisma.receipt.count({
      where: { courseId, status: 'APPROVED' },
    })
    if (salesCount > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer cette formation: ${salesCount} étudiant(s) l'ont achetée. Vous pouvez la dépublier.`,
      })
    }

    await prisma.course.delete({ where: { id: courseId } })

    console.log(JSON.stringify({
      event: 'INSTRUCTOR_COURSE_DELETED',
      courseId,
      instructorId: req.user.id,
      timestamp: new Date().toISOString(),
    }))

    res.json({ message: 'Formation supprimée.' })
  } catch (err) { next(err) }
})

// ─── Upload thumbnail ────────────────────────────────────────
router.post('/upload-thumbnail', authenticate, isInstructor, isInstructorApproved, uploadThumb.single('image'), validateUploadContent('image'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucune image envoyée.' })
    // Chemin RELATIF : une URL absolue fige l'hôte et le port dans la base.
    // Le moindre changement (port, domaine, passage en HTTPS) casse alors
    // toutes les images déjà enregistrées. Le frontend sert /uploads sur la
    // même origine, en dev via le proxy Vite comme en production.
    res.json({ url: `/uploads/thumbnails/${req.file.filename}` })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════
// CRUD LEÇONS FORMATEUR
// ═══════════════════════════════════════════════════════════════

// ─── POST /api/instructor/courses/:id/lessons ────────────────
router.post('/courses/:id/lessons', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const courseId = validateId(req.params.id)
    if (!courseId) return res.status(400).json({ error: 'ID invalide.' })

    const { title, description, externalVideoUrl, duration } = req.body
    if (!title || !externalVideoUrl)
      return res.status(400).json({ error: 'Titre et URL vidéo requis.' })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true },
    })
    if (!course) return res.status(404).json({ error: 'Formation introuvable.' })

    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez ajouter des leçons qu\'à vos propres formations.' })
    }

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

    res.status(201).json({ message: 'Leçon ajoutée.', lesson })
  } catch (err) { next(err) }
})

// ─── PUT /api/instructor/lessons/:id ─────────────────────────
router.put('/lessons/:id', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const lessonId = validateId(req.params.id)
    if (!lessonId) return res.status(400).json({ error: 'ID invalide.' })

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { instructorId: true } } },
    })
    if (!lesson) return res.status(404).json({ error: 'Leçon introuvable.' })

    if (lesson.course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres leçons.' })
    }

    const { title, description, externalVideoUrl, duration, order } = req.body

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

    res.json({ message: 'Leçon modifiée.', lesson: updated })
  } catch (err) { next(err) }
})

// ─── DELETE /api/instructor/lessons/:id ──────────────────────
router.delete('/lessons/:id', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const lessonId = validateId(req.params.id)
    if (!lessonId) return res.status(400).json({ error: 'ID invalide.' })

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { instructorId: true } } },
    })
    if (!lesson) return res.status(404).json({ error: 'Leçon introuvable.' })

    if (lesson.course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres leçons.' })
    }

    await prisma.lesson.delete({ where: { id: lessonId } })
    res.json({ message: 'Leçon supprimée.' })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════
// REVENUS, STATISTIQUES & RETRAITS
// ═══════════════════════════════════════════════════════════════

// ─── GET /api/instructor/stats — Statistiques mensuelles ───
router.get('/stats', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const instructorId = req.user.id

    // Ventes approuvées pour les cours de cet instructeur
    const receipts = await prisma.receipt.findMany({
      where: {
        course: { instructorId },
        status: 'APPROVED',
      },
      select: {
        amount: true,
        instructorEarnings: true,
        createdAt: true,
        userId: true
      }
    })

    let totalRevenue = 0
    const uniqueStudents = new Set()
    
    // Groupement par mois (format YYYY-MM)
    const monthlyDataMap = {}

    receipts.forEach(r => {
      totalRevenue += (r.instructorEarnings || 0)
      uniqueStudents.add(r.userId)

      const date = new Date(r.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey] = { name: monthKey, revenue: 0, sales: 0 }
      }
      monthlyDataMap[monthKey].revenue += (r.instructorEarnings || 0)
      monthlyDataMap[monthKey].sales += 1
    })

    // Trier les mois chronologiquement
    const chartData = Object.values(monthlyDataMap).sort((a, b) => a.name.localeCompare(b.name))

    res.json({
      totalRevenue,
      totalStudents: uniqueStudents.size,
      totalSales: receipts.length,
      chartData
    })
  } catch (err) { next(err) }
})

// ─── GET /api/instructor/earnings — Historique des revenus ───
router.get('/earnings', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const instructorId = req.user.id
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const [sales, total, instructor] = await Promise.all([
      prisma.receipt.findMany({
        where: { course: { instructorId }, status: 'APPROVED' },
        include: {
          course: { select: { id: true, title: true, price: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.receipt.count({
        where: { course: { instructorId }, status: 'APPROVED' },
      }),
      prisma.user.findUnique({
        where: { id: instructorId },
        select: { instructorBalance: true },
      }),
    ])

    res.json({
      sales,
      balance: instructor.instructorBalance || 0,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// ─── POST /api/instructor/identity — Soumettre sa pièce d'identité
router.post('/identity', authenticate, isInstructor, isInstructorApproved,
  uploadIdentity.single('identityDoc'), validateUploadContent('identityDoc'), async (req, res, next) => {
  try {
    const userId = req.user.id
    const fullName = (req.body.fullName || '').trim()

    if (!fullName || fullName.length < 3) {
      return res.status(400).json({ error: 'Le nom légal complet est requis.' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Le document d\'identité est requis.' })
    }

    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { identityStatus: true, identityDocPath: true },
    })

    // Une identité déjà validée ne se remplace pas librement : cela contournerait
    // la vérification en changeant de bénéficiaire après coup.
    if (current?.identityStatus === 'VERIFIED') {
      fs.unlink(req.file.path, () => {})
      return res.status(409).json({
        error: 'Votre identité est déjà vérifiée. Contactez l\'administration pour la modifier.',
      })
    }

    // Nettoyage de l'ancienne pièce refusée pour ne pas accumuler de données sensibles
    if (current?.identityDocPath) {
      const oldPath = path.join(__dirname, '..', current.identityDocPath)
      fs.unlink(oldPath, () => {})
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        identityFullName: fullName,
        identityDocPath: `uploads/identities/${req.file.filename}`,
        identityStatus: 'PENDING',
        identitySubmittedAt: new Date(),
        identityNotes: null,
      },
    })

    console.log(JSON.stringify({
      event: 'IDENTITY_SUBMITTED',
      userId,
      timestamp: new Date().toISOString(),
    }))

    res.status(201).json({
      message: 'Document envoyé. L\'administration va vérifier votre identité.',
      identityStatus: 'PENDING',
    })
  } catch (err) { next(err) }
})

// ─── GET /api/instructor/payout-eligibility — Conditions de retrait
// Expose les règles configurées par l'admin + l'état du formateur, pour que
// l'interface explique précisément ce qui bloque au lieu de masquer le bouton.
router.get('/payout-eligibility', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const settings = getSettings()
    const minPayout = settings.marketplace?.minPayoutAmount ?? 1000
    const maxPayout = settings.marketplace?.maxPayoutAmount || 0
    const payoutsEnabled = settings.marketplace?.payoutsEnabled !== false
    const requireIdentity = settings.marketplace?.requireIdentityForPayout !== false

    const [user, pendingPayout] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { instructorBalance: true, identityStatus: true, identityNotes: true },
      }),
      prisma.instructorPayout.findFirst({
        where: { instructorId: req.user.id, status: 'PENDING' },
        select: { id: true, reference: true, amount: true, createdAt: true },
      }),
    ])

    const balance = user?.instructorBalance || 0
    const identityStatus = user?.identityStatus || 'NONE'

    // Raison de blocage la plus prioritaire d'abord
    let blockedReason = null
    if (!payoutsEnabled) blockedReason = 'PAYOUTS_DISABLED'
    else if (requireIdentity && identityStatus !== 'VERIFIED') blockedReason = 'IDENTITY_REQUIRED'
    else if (pendingPayout) blockedReason = 'PENDING_PAYOUT'
    else if (balance < minPayout) blockedReason = 'BELOW_MINIMUM'

    res.json({
      canRequest: blockedReason === null,
      blockedReason,
      balance,
      minPayout,
      maxPayout,
      payoutsEnabled,
      requireIdentity,
      identityStatus,
      identityNotes: user?.identityNotes || null,
      pendingPayout,
    })
  } catch (err) { next(err) }
})

// ─── POST /api/instructor/payout-request — Demande de retrait
router.post('/payout-request', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const instructorId = req.user.id
    const { amount, method = 'CCP', accountInfo } = req.body

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Montant invalide.' })
    }

    const settings = getSettings()
    const minPayout = settings.marketplace?.minPayoutAmount ?? 1000
    const maxPayout = settings.marketplace?.maxPayoutAmount || 0

    // Retraits suspendus globalement par l'admin
    if (settings.marketplace?.payoutsEnabled === false) {
      return res.status(403).json({ error: 'Les retraits sont temporairement suspendus. Contactez l\'administration.' })
    }

    if (parseFloat(amount) < minPayout) {
      return res.status(400).json({ error: `Le montant minimum de retrait est ${minPayout} DA.` })
    }

    if (maxPayout > 0 && parseFloat(amount) > maxPayout) {
      return res.status(400).json({ error: `Le montant maximum par demande est ${maxPayout} DA.` })
    }

    const validMethods = ['CCP', 'BARIDIMOB', 'EDAHABIA']
    if (!validMethods.includes(method)) {
      return res.status(400).json({ error: 'Méthode de retrait invalide.' })
    }

    // Identité vérifiée exigée : aucun versement vers un bénéficiaire non identifié
    const requireIdentity = settings.marketplace?.requireIdentityForPayout !== false
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { identityStatus: true, identityFullName: true },
    })

    if (requireIdentity && instructor?.identityStatus !== 'VERIFIED') {
      return res.status(403).json({
        error: 'Votre identité doit être vérifiée par l\'administration avant tout retrait.',
        code: 'IDENTITY_REQUIRED',
        identityStatus: instructor?.identityStatus || 'NONE',
      })
    }

    let payout
    try {
      payout = await prisma.$transaction(async (tx) => {
        // Atomic deduction to prevent negative balance race conditions
        const updatedUser = await tx.user.updateMany({
          where: { id: instructorId, instructorBalance: { gte: parseFloat(amount) } },
          data: { instructorBalance: { decrement: parseFloat(amount) } },
        })

        if (updatedUser.count === 0) {
          throw new Error('INSUFFICIENT_BALANCE')
        }

        // Vérifier s'il y a un retrait en attente
        const pendingPayout = await tx.instructorPayout.findFirst({
          where: { instructorId, status: 'PENDING' },
        })
        if (pendingPayout) {
          // Rollback deduction if pending payout already exists
          await tx.user.update({
            where: { id: instructorId },
            data: { instructorBalance: { increment: parseFloat(amount) } },
          })
          throw new Error('PENDING_PAYOUT_EXISTS')
        }

        const newPayout = await tx.instructorPayout.create({
          data: {
            // Référence communicable, figée à la création (traçabilité)
            reference: `RET-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            instructorId,
            amount: parseFloat(amount),
            method,
            accountInfo: accountInfo?.trim() || null,
            // Nom légal figé au moment de la demande : l'historique reste exact
            // même si le profil est modifié plus tard.
            identityFullName: instructor?.identityFullName || null,
          },
        })

        return newPayout
      })
    } catch (txError) {
      if (txError.message === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({ error: 'Solde insuffisant.' })
      }
      if (txError.message === 'PENDING_PAYOUT_EXISTS') {
        return res.status(409).json({ error: 'Vous avez déjà une demande de retrait en attente.' })
      }
      throw txError
    }

    console.log(JSON.stringify({
      event: 'INSTRUCTOR_PAYOUT_REQUESTED',
      instructorId,
      amount: parseFloat(amount),
      method,
      payoutId: payout.id,
      timestamp: new Date().toISOString(),
    }))

    res.status(201).json({
      message: 'Demande de retrait soumise. L\'admin va la traiter.',
      payout,
    })
  } catch (err) { next(err) }
})

// ─── GET /api/instructor/payouts — Historique des retraits ───
router.get('/payouts', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const instructorId = req.user.id

    const payouts = await prisma.instructorPayout.findMany({
      where: { instructorId },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ payouts })
  } catch (err) { next(err) }
})

// ─── PUT /api/instructor/profile — Modifier bio formateur ────
router.put('/profile', authenticate, isInstructor, async (req, res, next) => {
  try {
    const { instructorBio } = req.body

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { instructorBio: instructorBio?.trim() || null },
      select: { id: true, name: true, instructorBio: true },
    })

    res.json({ message: 'Profil formateur mis à jour.', user: updated })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════
// COUPONS FORMATEUR
// Un formateur ne peut créer des coupons que sur SES formations.
// Les coupons globaux (sans formation) restent réservés à l'admin.
// ═══════════════════════════════════════════════════════════════

const COUPON_CODE_REGEX = /^[A-Z0-9-]{3,30}$/

// Vérifie que la formation appartient bien au formateur connecté.
async function assertOwnsCourse(courseId, instructorId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true, title: true },
  })
  if (!course || course.instructorId !== instructorId) return null
  return course
}

// ─── GET /api/instructor/coupons — Mes coupons ───────────────
router.get('/coupons', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { createdById: req.user.id },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ coupons })
  } catch (err) { next(err) }
})

// ─── POST /api/instructor/coupons — Créer un coupon ──────────
router.post('/coupons', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const instructorId = req.user.id
    const { code, discountPercent, maxUses, expiresAt, courseId } = req.body

    const parsedCourseId = validateId(courseId)
    if (!parsedCourseId) {
      return res.status(400).json({ error: 'Sélectionnez la formation concernée par ce coupon.' })
    }

    const course = await assertOwnsCourse(parsedCourseId, instructorId)
    if (!course) {
      return res.status(403).json({ error: 'Cette formation ne vous appartient pas.' })
    }

    const normalizedCode = String(code || '').toUpperCase().trim()
    if (!COUPON_CODE_REGEX.test(normalizedCode)) {
      return res.status(400).json({ error: 'Code invalide : 3 à 30 caractères, lettres majuscules, chiffres ou tirets.' })
    }

    const percent = parseInt(discountPercent, 10)
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      return res.status(400).json({ error: 'La réduction doit être un entier entre 1 et 100 %.' })
    }

    const uses = maxUses === undefined || maxUses === '' ? 100 : parseInt(maxUses, 10)
    if (!Number.isInteger(uses) || uses < 1 || uses > 10000) {
      return res.status(400).json({ error: 'Le nombre d\'utilisations doit être entre 1 et 10000.' })
    }

    let expiry = null
    if (expiresAt) {
      expiry = new Date(expiresAt)
      if (isNaN(expiry.getTime())) return res.status(400).json({ error: 'Date d\'expiration invalide.' })
      if (expiry <= new Date()) return res.status(400).json({ error: 'La date d\'expiration doit être dans le futur.' })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        discountPercent: percent,
        maxUses: uses,
        expiresAt: expiry,
        courseId: course.id,
        createdById: instructorId,
      },
      include: { course: { select: { id: true, title: true } } },
    })

    console.log(JSON.stringify({
      event: 'INSTRUCTOR_COUPON_CREATED',
      couponId: coupon.id,
      instructorId,
      courseId: course.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      timestamp: new Date().toISOString(),
    }))

    res.status(201).json({ message: 'Coupon créé.', coupon })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ce code existe déjà.' })
    next(err)
  }
})

// ─── PUT /api/instructor/coupons/:id — Activer / désactiver ──
router.put('/coupons/:id', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const couponId = validateId(req.params.id)
    if (!couponId) return res.status(400).json({ error: 'ID invalide.' })

    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } })
    if (!coupon || coupon.createdById !== req.user.id) {
      return res.status(404).json({ error: 'Coupon introuvable.' })
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: Boolean(req.body.isActive) },
      include: { course: { select: { id: true, title: true } } },
    })

    res.json({ message: updated.isActive ? 'Coupon activé.' : 'Coupon désactivé.', coupon: updated })
  } catch (err) { next(err) }
})

// ─── DELETE /api/instructor/coupons/:id — Supprimer ──────────
router.delete('/coupons/:id', authenticate, isInstructor, isInstructorApproved, async (req, res, next) => {
  try {
    const couponId = validateId(req.params.id)
    if (!couponId) return res.status(400).json({ error: 'ID invalide.' })

    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } })
    if (!coupon || coupon.createdById !== req.user.id) {
      return res.status(404).json({ error: 'Coupon introuvable.' })
    }

    // Un coupon déjà utilisé est rattaché à des reçus : on le désactive au lieu
    // de le supprimer, pour ne pas casser l'historique des ventes.
    if (coupon.currentUses > 0) {
      return res.status(409).json({
        error: 'Ce coupon a déjà été utilisé — désactivez-le au lieu de le supprimer.',
        code: 'COUPON_ALREADY_USED',
      })
    }

    await prisma.coupon.delete({ where: { id: couponId } })
    res.json({ message: 'Coupon supprimé.' })
  } catch (err) { next(err) }
})

module.exports = router
