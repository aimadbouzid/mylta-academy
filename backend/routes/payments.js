// ============================================================
// ROUTES PAYMENTS — Mylta Academy (Production-Ready)
// Idempotency, Strict Validation, i18n, Audit Logging
// ============================================================

const express = require('express')
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const prisma = require('../prisma')
const { authenticate } = require('../middleware/auth')
const { t } = require('../i18n')
const { validateId, validatePaymentType } = require('../middleware/security')
const { validateUploadContent } = require('../middleware/uploadValidator')

const router = express.Router()

// ─── Configuration Multer (upload reçus) ──────────────────────
const mimeToExt = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/pjpeg': '.jpg',
  'image/png': '.png',
  'image/x-png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../uploads/receipts')),
  filename: (req, file, cb) => {
    const uid = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`
    const ext = mimeToExt[file.mimetype?.toLowerCase()] || '.bin'
    cb(null, `receipt-${uid}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype?.toLowerCase())) cb(null, true)
    else cb(new Error(t('errors.file_format_invalid', 'fr')))
  },
})

// ─── POST /api/payments/receipt ───────────────────────────────
router.post('/receipt', authenticate, upload.single('receiptImage'), validateUploadContent('receiptImage'), async (req, res, next) => {
  try {
    const { courseId, paymentType = 'CCP', notes, idempotencyKey } = req.body
    const userId = req.user.id

    if (!courseId)
      return res.status(400).json({ error: t('payments.course_id_required', req.lang) })

    // Validation stricte du paymentType
    const validType = validatePaymentType(paymentType)
    if (!validType) {
      return res.status(400).json({ error: t('payments.payment_type_invalid', req.lang) })
    }

    // Idempotency check
    if (idempotencyKey) {
      const existing = await prisma.receipt.findUnique({
        where: { idempotencyKey },
      })
      if (existing) {
        return res.status(409).json({
          error: t('payments.duplicate_idempotency', req.lang),
          receipt: {
            id: existing.id,
            status: existing.status,
            createdAt: existing.createdAt,
          },
        })
      }
    }

    const parsedCourseId = validateId(courseId)
    if (!parsedCourseId) {
      return res.status(400).json({ error: t('courses.id_invalid', req.lang) })
    }

    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: { id: true, title: true, price: true },
    })
    if (!course) return res.status(404).json({ error: t('payments.course_not_found', req.lang) })

    // Vérifier accès existant
    const approved = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'APPROVED' },
    })
    if (approved)
      return res.status(409).json({ error: t('payments.already_access', req.lang) })

    const pending = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'PENDING' },
    })
    if (pending)
      return res.status(409).json({ error: t('payments.pending_receipt', req.lang) })

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        courseId: course.id,
        amount: course.price,
        status: 'PENDING',
        paymentType: validType,
        receiptImage: req.file ? `/uploads/receipts/${req.file.filename}` : null,
        idempotencyKey: idempotencyKey || null,
        notes: notes || null,
      },
    })

    // Audit log structuré
    console.log(JSON.stringify({
      event: 'PAYMENT_RECEIPT_SUBMITTED',
      userId,
      courseId: course.id,
      courseTitle: course.title,
      paymentType: validType,
      receiptId: receipt.id,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    res.status(201).json({
      message: t('payments.receipt_submitted', req.lang),
      receipt: {
        id: receipt.id,
        status: receipt.status,
        paymentType: receipt.paymentType,
        amount: receipt.amount,
        course: { id: course.id, title: course.title },
        createdAt: receipt.createdAt,
      },
    })
  } catch (err) { next(err) }
})

// ─── POST /api/payments/edahabia/checkout ─────────────────────
router.post('/edahabia/checkout', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    if (!courseId) return res.status(400).json({ error: t('payments.course_id_required', req.lang) })

    const parsedCourseId = validateId(courseId)
    if (!parsedCourseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: { id: true, price: true },
    })
    if (!course) return res.status(404).json({ error: t('payments.course_not_found', req.lang) })

    const approved = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'APPROVED' },
    })
    if (approved) return res.status(409).json({ error: t('payments.already_access', req.lang) })

    const pending = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'PENDING', paymentType: 'EDAHABIA' },
    })

    let transactionId;
    let receiptId;

    if (pending) {
      transactionId = pending.transactionId || `TXN-${Date.now()}`
      receiptId = pending.id
      if (!pending.transactionId) {
         await prisma.receipt.update({ where: { id: pending.id }, data: { transactionId } })
      }
    } else {
      transactionId = `TXN-${Date.now()}`
      const newReceipt = await prisma.receipt.create({
        data: {
          userId,
          courseId: course.id,
          amount: course.price,
          status: 'PENDING',
          paymentType: 'EDAHABIA',
          transactionId,
          notes: `En attente paiement Edahabia`,
        },
      })
      receiptId = newReceipt.id
    }

    const checkoutUrl = `https://test.satim.dz/checkout?txn=${transactionId}&amount=${course.price}`

    res.json({ checkoutUrl, transactionId, receiptId })
  } catch (err) { next(err) }
})

// ─── POST /api/payments/edahabia/webhook ──────────────────────
router.post('/edahabia/webhook', async (req, res, next) => {
  try {
    const { transactionId, courseId, userId, amount, status, signature } = req.body

    // HMAC verification
    const webhookSecret = process.env.EDAHABIA_WEBHOOK_SECRET
    if (!webhookSecret || webhookSecret === 'edahabia_secret_changez_moi') {
      console.error('❌ [WEBHOOK] EDAHABIA_WEBHOOK_SECRET non configuré ou valeur par défaut.')
      return res.status(503).json({ error: t('payments.webhook_not_configured', req.lang) })
    }

    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${transactionId}:${courseId}:${userId}:${amount}`)
      .digest('hex')
    // Timing-safe comparison to prevent timing attacks (OWASP ASVS)
    const sigBuffer = Buffer.from(signature || '', 'utf8')
    const expectedBuffer = Buffer.from(expectedSig, 'utf8')
    if (!signature || sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      console.warn(JSON.stringify({
        event: 'WEBHOOK_SIGNATURE_INVALID',
        transactionId,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(401).json({ error: t('payments.webhook_signature_invalid', req.lang) })
    }

    if (status !== 'SUCCESS') {
      return res.json({ received: true, action: 'none', status })
    }

    if (!transactionId || !courseId || !userId) {
      return res.status(400).json({ error: t('payments.webhook_payload_incomplete', req.lang) })
    }

    const parsedUserId = validateId(userId)
    const parsedCourseId = validateId(courseId)
    if (!parsedUserId || !parsedCourseId) {
      return res.status(400).json({ error: t('courses.id_invalid', req.lang) })
    }

    // Vérifier l'existence d'un reçu en attente
    const pendingReceipt = await prisma.receipt.findFirst({
      where: { transactionId, status: 'PENDING', paymentType: 'EDAHABIA' },
    })

    if (!pendingReceipt) {
      console.warn(JSON.stringify({
        event: 'WEBHOOK_TRANSACTION_NOT_FOUND',
        transactionId,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(404).json({ error: 'Transaction introuvable ou déjà traitée.' })
    }

    if (pendingReceipt.userId !== parsedUserId || pendingReceipt.courseId !== parsedCourseId) {
      return res.status(400).json({ error: 'Incohérence entre la transaction et l\'utilisateur/formation.' })
    }

    if (parseFloat(amount) < pendingReceipt.amount) {
      console.warn(JSON.stringify({
        event: 'WEBHOOK_AMOUNT_MISMATCH',
        transactionId,
        received: amount,
        expected: pendingReceipt.amount,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(400).json({ error: t('payments.amount_invalid', req.lang) })
    }

    const receipt = await prisma.receipt.update({
      where: { id: pendingReceipt.id },
      data: {
        status: 'APPROVED',
        notes: `Auto-approved – Edahabia txn: ${transactionId}`,
      },
      include: {
        course: { select: { title: true } }
      }
    })

    // Process Referral System
    const { processReferral } = require('../referralManager')
    await processReferral(parsedUserId, receipt.course.title)

    // Audit log
    console.log(JSON.stringify({
      event: 'WEBHOOK_PAYMENT_APPROVED',
      transactionId,
      userId: parsedUserId,
      courseId: parsedCourseId,
      receiptId: receipt.id,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    res.json({ received: true, action: 'access_granted', receiptId: receipt.id })
  } catch (err) { next(err) }
})

// ─── GET /api/payments/my-receipts (paginé) ──────────────────
router.get('/my-receipts', authenticate, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where: { userId: req.user.id },
        include: { course: { select: { id: true, title: true, thumbnail: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.receipt.count({ where: { userId: req.user.id } }),
    ])

    res.json({
      receipts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) { next(err) }
})

// ─── POST /api/payments/unlock-free ───────────────────────────
router.post('/unlock-free', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    if (!courseId) return res.status(400).json({ error: 'ID de formation requis.' })

    const parsedCourseId = validateId(courseId)
    if (!parsedCourseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeCoursesEarned: true }
    })

    if (!user || user.freeCoursesEarned <= 0) {
      return res.status(400).json({ error: "Vous n'avez pas de crédit de formation gratuite." })
    }

    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: { id: true, title: true, price: true }
    })
    if (!course) return res.status(404).json({ error: t('payments.course_not_found', req.lang) })

    // Check if already approved or pending
    const approved = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'APPROVED' },
    })
    if (approved) return res.status(409).json({ error: t('payments.already_access', req.lang) })

    // Decrement freeCoursesEarned and create receipt in a transaction
    const [updatedUser, receipt] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { freeCoursesEarned: { decrement: 1 } }
      }),
      prisma.receipt.create({
        data: {
          userId,
          courseId: course.id,
          amount: 0,
          status: 'APPROVED',
          paymentType: 'REFERRAL_REWARD',
          notes: 'Débloqué gratuitement via parrainage',
        }
      })
    ])

    res.json({
      message: 'Formation débloquée gratuitement avec succès !',
      receipt
    })
  } catch (err) { next(err) }
})

module.exports = router
