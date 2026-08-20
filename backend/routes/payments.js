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
const { getSettings } = require('../settingsManager')
const { createCheckout, verifyWebhookSignature } = require('../services/chargilyService')
const stripeService = require('../services/stripeService')
const paypalService = require('../services/paypalService')
const { resolveCoupon } = require('../utils/coupons')

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
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype?.toLowerCase())) cb(null, true)
    else cb(new Error(t('errors.file_format_invalid', 'fr')))
  },
})

// ─── POST /api/payments/coupon/validate ────────────────────────
// ─── Helper: calcule prix final + commission formateur ─────────
// Utilisé par les nouvelles routes Stripe/PayPal pour éviter de
// retripliquer la logique déjà dupliquée entre /receipt et /chargily.
async function computeOrderPricing(course, couponCode) {
  let finalPrice = course.price
  if (course.discountPrice && course.discountPrice < course.price) {
    if (!course.discountEndsAt || new Date() < new Date(course.discountEndsAt)) {
      finalPrice = course.discountPrice
    }
  }

  let appliedCoupon = null
  if (couponCode) {
    const { coupon } = await resolveCoupon(couponCode, course.id)
    if (coupon) {
      const discountAmount = (finalPrice * coupon.discountPercent) / 100
      finalPrice = Math.max(0, finalPrice - discountAmount)
      appliedCoupon = coupon
    }
  }

  let instructorEarnings = null
  let platformCommission = null
  if (course.instructorId) {
    const instructor = await prisma.user.findUnique({
      where: { id: course.instructorId },
      select: { commissionRate: true },
    })
    const settings = getSettings()
    const rate = instructor?.commissionRate ?? settings.marketplace?.defaultCommissionRate ?? 20
    platformCommission = finalPrice * (rate / 100)
    instructorEarnings = finalPrice - platformCommission
  }

  return { finalPrice, appliedCoupon, instructorEarnings, platformCommission }
}

router.post('/coupon/validate', authenticate, async (req, res) => {
  try {
    const { code, courseId } = req.body
    if (!code || !courseId) return res.status(400).json({ error: 'Code et courseId requis' })

    const parsedCourseId = validateId(courseId)
    if (!parsedCourseId) return res.status(400).json({ error: 'CourseId invalide' })

    const course = await prisma.course.findUnique({ where: { id: parsedCourseId } })
    if (!course) return res.status(404).json({ error: 'Formation introuvable' })

    const { coupon, error, status } = await resolveCoupon(code, parsedCourseId)
    if (error) return res.status(status).json({ error })

    const currentPrice = course.discountPrice || course.price
    const discountAmount = (currentPrice * coupon.discountPercent) / 100
    const newPrice = Math.max(0, currentPrice - discountAmount)

    res.json({
      valid: true,
      discountPercent: coupon.discountPercent,
      originalPrice: currentPrice,
      newPrice: newPrice
    })
  } catch (error) {
    console.error('Erreur validation coupon:', error)
    res.status(500).json({ error: 'Erreur interne lors de la validation du coupon' })
  }
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
      select: { id: true, title: true, price: true, instructorId: true },
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

    let finalPrice = course.price
    if (course.discountPrice && course.discountPrice < course.price) {
      finalPrice = course.discountPrice
    }

    // Gérer le code promo si fourni
    const { couponCode } = req.body
    let appliedCoupon = null

    if (couponCode) {
      const { coupon } = await resolveCoupon(couponCode, course.id)
      if (coupon) {
        const discountAmount = (finalPrice * coupon.discountPercent) / 100
        finalPrice = Math.max(0, finalPrice - discountAmount)
        appliedCoupon = coupon
      }
    }

    // Calculate commission if this is an instructor's course
    let instructorEarnings = null
    let platformCommission = null
    if (course.instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: course.instructorId },
        select: { commissionRate: true },
      })
      const settings = getSettings()
      const rate = instructor?.commissionRate ?? settings.marketplace?.defaultCommissionRate ?? 20
      platformCommission = finalPrice * (rate / 100)
      instructorEarnings = finalPrice - platformCommission
    }

    const receiptNotes = appliedCoupon 
      ? `[COUPON APLIQUÉ: ${appliedCoupon.code} (-${appliedCoupon.discountPercent}%)] ${notes || ''}`.trim()
      : (notes || null)

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        courseId: course.id,
        amount: finalPrice,
        status: 'PENDING',
        paymentType: validType,
        receiptImage: req.file ? `/uploads/receipts/${req.file.filename}` : null,
        idempotencyKey: idempotencyKey || null,
        notes: receiptNotes,
        instructorEarnings,
        platformCommission,
        couponId: appliedCoupon ? appliedCoupon.id : undefined,
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

    // Atomic update to prevent Double Payout race condition
    const updateResult = await prisma.receipt.updateMany({
      where: { id: pendingReceipt.id, status: 'PENDING' },
      data: {
        status: 'APPROVED',
        notes: `Auto-approved – Edahabia txn: ${transactionId}`,
      }
    })

    if (updateResult.count === 0) {
      console.warn(JSON.stringify({
        event: 'WEBHOOK_RACE_CONDITION_BLOCKED',
        transactionId,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(409).json({ error: 'Transaction déjà traitée par une autre requête concurrentielle.' })
    }

    // Fetch the updated receipt
    const receipt = await prisma.receipt.findUnique({
      where: { id: pendingReceipt.id },
      include: {
        course: { select: { title: true, instructorId: true } }
      }
    })

    // Process Referral System
    const { processReferral } = require('../referralManager')
    await processReferral(parsedUserId, receipt.course.title)

    // Credit instructor balance if this is an instructor's course
    if (receipt.course.instructorId && receipt.instructorEarnings) {
      await prisma.user.update({
        where: { id: receipt.course.instructorId },
        data: { instructorBalance: { increment: receipt.instructorEarnings } },
      })
    }

    // Audit log
    console.log(JSON.stringify({
      event: 'WEBHOOK_PAYMENT_APPROVED',
      transactionId,
      userId: parsedUserId,
      courseId: parsedCourseId,
      receiptId: receipt.id,
      instructorEarnings: receipt.instructorEarnings,
      platformCommission: receipt.platformCommission,
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

    let receipt
    try {
      receipt = await prisma.$transaction(async (tx) => {
        // Atomic deduction to prevent Race Condition
        const updatedUser = await tx.user.updateMany({
          where: { id: userId, freeCoursesEarned: { gte: 1 } },
          data: { freeCoursesEarned: { decrement: 1 } }
        })

        if (updatedUser.count === 0) {
          throw new Error('INSUFFICIENT_CREDITS')
        }

        // Check if already approved or pending
        const approved = await tx.receipt.findFirst({
          where: { userId, courseId: course.id, status: 'APPROVED' },
        })
        if (approved) {
          // Rollback the deduction if user already has access
          await tx.user.update({
            where: { id: userId },
            data: { freeCoursesEarned: { increment: 1 } }
          })
          throw new Error('ALREADY_ACCESS')
        }

        return await tx.receipt.create({
          data: {
            userId,
            courseId: course.id,
            amount: 0,
            status: 'APPROVED',
            paymentType: 'REFERRAL_REWARD',
            notes: 'Débloqué gratuitement via parrainage',
          }
        })
      })
    } catch (txError) {
      if (txError.message === 'INSUFFICIENT_CREDITS') {
        return res.status(400).json({ error: "Vous n'avez pas de crédit de formation gratuite." })
      }
      if (txError.message === 'ALREADY_ACCESS') {
        return res.status(409).json({ error: t('payments.already_access', req.lang) })
      }
      throw txError
    }

    res.json({
      message: 'Formation débloquée gratuitement avec succès !',
      receipt
    })
  } catch (err) { next(err) }
})

// ─── POST /api/payments/chargily/checkout ─────────────────────
// Crée un checkout Chargily Pay et retourne l'URL de paiement
router.post('/chargily/checkout', authenticate, async (req, res, next) => {
  try {
    const { courseId, couponCode } = req.body
    const userId = req.user.id

    if (!courseId) return res.status(400).json({ error: t('payments.course_id_required', req.lang) })

    const parsedCourseId = validateId(courseId)
    if (!parsedCourseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    // Vérifier que Chargily est configuré
    if (!process.env.CHARGILY_SECRET_KEY) {
      console.error(JSON.stringify({
        event: 'CHARGILY_NOT_CONFIGURED',
        userId,
        courseId: parsedCourseId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(503).json({ error: 'Le paiement en ligne n\'est pas disponible actuellement.' })
    }

    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: { id: true, title: true, price: true, discountPrice: true, discountEndsAt: true, instructorId: true },
    })
    if (!course) return res.status(404).json({ error: t('payments.course_not_found', req.lang) })

    // Vérifier accès existant
    const approved = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'APPROVED' },
    })
    if (approved) return res.status(409).json({ error: t('payments.already_access', req.lang) })

    // Vérifier checkout Chargily PENDING existant (éviter les doublons)
    const existingPending = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'PENDING', paymentType: 'CHARGILY' },
    })
    if (existingPending && existingPending.chargilyCheckoutId) {
      // Un checkout existe déjà, mais on en crée un nouveau car Chargily ne permet pas de réutiliser un checkout
      // On marque l'ancien comme REJECTED pour éviter la confusion
      await prisma.receipt.update({
        where: { id: existingPending.id },
        data: { status: 'REJECTED', notes: 'Remplacé par un nouveau checkout Chargily' },
      })
    }

    // Calculer le prix final
    let finalPrice = course.price
    if (course.discountPrice && course.discountPrice < course.price) {
      // Vérifier si la promo est encore active
      if (!course.discountEndsAt || new Date() < new Date(course.discountEndsAt)) {
        finalPrice = course.discountPrice
      }
    }

    // Gérer le code promo si fourni
    let appliedCoupon = null
    if (couponCode) {
      const { coupon } = await resolveCoupon(couponCode, course.id)
      if (coupon) {
        const discountAmount = (finalPrice * coupon.discountPercent) / 100
        finalPrice = Math.max(0, finalPrice - discountAmount)
        appliedCoupon = coupon
      }
    }

    // Calculer la commission formateur
    let instructorEarnings = null
    let platformCommission = null
    if (course.instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: course.instructorId },
        select: { commissionRate: true },
      })
      const settings = getSettings()
      const rate = instructor?.commissionRate ?? settings.marketplace?.defaultCommissionRate ?? 20
      platformCommission = finalPrice * (rate / 100)
      instructorEarnings = finalPrice - platformCommission
    }

    // Générer un orderId unique
    const orderId = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

    // Construire les URLs de retour
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const successUrl = `${frontendUrl}/payment/success?orderId=${orderId}`
    const failureUrl = `${frontendUrl}/payment/failure?orderId=${orderId}`

    // Créer le Receipt PENDING
    const receiptNotes = appliedCoupon
      ? `[COUPON APPLIQUÉ: ${appliedCoupon.code} (-${appliedCoupon.discountPercent}%)] Chargily Pay`
      : 'Chargily Pay'

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        courseId: course.id,
        amount: finalPrice,
        status: 'PENDING',
        paymentType: 'CHARGILY',
        transactionId: orderId,
        notes: receiptNotes,
        instructorEarnings,
        platformCommission,
        couponId: appliedCoupon ? appliedCoupon.id : undefined,
      },
    })

    // Appeler l'API Chargily pour créer le checkout
    const { checkoutUrl, checkoutId } = await createCheckout({
      amount: finalPrice,
      courseName: course.title,
      orderId,
      userId,
      courseId: course.id,
      successUrl,
      failureUrl,
    })

    // Mettre à jour le receipt avec le chargilyCheckoutId
    await prisma.receipt.update({
      where: { id: receipt.id },
      data: { chargilyCheckoutId: checkoutId },
    })


    // Audit log
    console.log(JSON.stringify({
      event: 'CHARGILY_CHECKOUT_INITIATED',
      userId,
      courseId: course.id,
      courseTitle: course.title,
      receiptId: receipt.id,
      orderId,
      chargilyCheckoutId: checkoutId,
      amount: finalPrice,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    res.json({ checkoutUrl, orderId, receiptId: receipt.id })
  } catch (err) {
    // Si c'est une erreur Chargily spécifique, retourner 502
    if (err.message?.includes('Chargily checkout creation failed')) {
      console.error(JSON.stringify({
        event: 'CHARGILY_CHECKOUT_ERROR',
        error: err.message,
        userId: req.user?.id,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(502).json({ error: 'Erreur de connexion avec le service de paiement. Réessayez.' })
    }
    next(err)
  }
})

// ─── POST /api/payments/chargily/webhook ──────────────────────
// Webhook appelé par Chargily Pay pour confirmer le paiement
// IMPORTANT: Cette route utilise le raw body (express.raw) pour la vérification HMAC
router.post('/chargily/webhook', async (req, res) => {
  try {
    // Le body brut est stocké dans req.rawBody par le middleware dans server.js
    const rawBody = req.rawBody || req.body
    const signature = req.headers['signature']

    // Vérifier la signature HMAC-SHA256
    const rawBodyStr = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(rawBody))
    if (!verifyWebhookSignature(rawBodyStr, signature)) {
      console.warn(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_SIGNATURE_INVALID',
        ip: req.ip,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(401).json({ error: 'Invalid webhook signature.' })
    }

    // Parser le body si nécessaire
    const payload = Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString('utf8')) : rawBody

    console.log(JSON.stringify({
      event: 'CHARGILY_WEBHOOK_RECEIVED',
      checkoutId: payload?.data?.id,
      status: payload?.data?.status,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    // Structure Chargily webhook: { id, type, data: { id, status, amount, metadata, ... } }
    const eventType = payload?.type
    const checkoutData = payload?.data

    if (!checkoutData || !checkoutData.id) {
      console.warn(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_INVALID_PAYLOAD',
        payload: JSON.stringify(payload).slice(0, 500),
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(400).json({ error: 'Invalid webhook payload.' })
    }

    const chargilyCheckoutId = checkoutData.id
    const checkoutStatus = checkoutData.status

    // Seul le statut "paid" nous intéresse
    if (checkoutStatus !== 'paid') {
      console.log(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_NON_PAID_STATUS',
        chargilyCheckoutId,
        status: checkoutStatus,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(200).json({ received: true, action: 'none', status: checkoutStatus })
    }

    // Rechercher le Receipt par chargilyCheckoutId
    const receipt = await prisma.receipt.findUnique({
      where: { chargilyCheckoutId },
      include: {
        course: { select: { title: true, instructorId: true } },
      },
    })

    if (!receipt) {
      console.warn(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_RECEIPT_NOT_FOUND',
        chargilyCheckoutId,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(404).json({ error: 'Receipt not found for this checkout.' })
    }

    // Idempotence: si déjà APPROVED, retourner 200 sans action
    if (receipt.status === 'APPROVED') {
      console.log(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_ALREADY_PROCESSED',
        chargilyCheckoutId,
        receiptId: receipt.id,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(200).json({ received: true, action: 'already_processed', receiptId: receipt.id })
    }

    // Si le receipt n'est pas PENDING, quelque chose ne va pas
    if (receipt.status !== 'PENDING') {
      console.warn(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_UNEXPECTED_STATUS',
        chargilyCheckoutId,
        receiptStatus: receipt.status,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(200).json({ received: true, action: 'none', currentStatus: receipt.status })
    }

    // Mise à jour atomique: PENDING → APPROVED (empêche les race conditions)
    const updateResult = await prisma.receipt.updateMany({
      where: { id: receipt.id, status: 'PENDING' },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        notes: `Auto-approved – Chargily Pay checkout: ${chargilyCheckoutId}`,
      },
    })

    if (updateResult.count === 0) {
      console.warn(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_RACE_CONDITION_BLOCKED',
        chargilyCheckoutId,
        receiptId: receipt.id,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(200).json({ received: true, action: 'already_processed' })
    }

    // ── Post-traitement après approbation ──

    // Système de parrainage
    try {
      const { processReferral } = require('../referralManager')
      await processReferral(receipt.userId, receipt.course.title)
    } catch (refErr) {
      console.error(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_REFERRAL_ERROR',
        error: refErr.message,
        receiptId: receipt.id,
        timestamp: new Date().toISOString(),
      }))
      // Ne pas bloquer le webhook pour une erreur de parrainage
    }

    // Créditer le formateur
    if (receipt.course.instructorId && receipt.instructorEarnings) {
      try {
        await prisma.user.update({
          where: { id: receipt.course.instructorId },
          data: { instructorBalance: { increment: receipt.instructorEarnings } },
        })
      } catch (instrErr) {
        console.error(JSON.stringify({
          event: 'CHARGILY_WEBHOOK_INSTRUCTOR_CREDIT_ERROR',
          error: instrErr.message,
          instructorId: receipt.course.instructorId,
          receiptId: receipt.id,
          timestamp: new Date().toISOString(),
        }))
      }
    }
    // Incrémenter le coupon si appliqué
    if (receipt.couponId) {
      try {
        await prisma.coupon.updateMany({
          where: { id: receipt.couponId },
          data: { currentUses: { increment: 1 } },
        })
      } catch (couponErr) {
        console.error('Erreur incrémentation coupon chargily webhook', couponErr)
      }
    }

    // Créer une notification pour l'utilisateur
    try {
      await prisma.notification.create({
        data: {
          userId: receipt.userId,
          title: 'Paiement confirmé ✅',
          message: `Votre paiement pour "${receipt.course.title}" a été confirmé. Vous pouvez accéder à la formation.`,
          type: 'SUCCESS',
        },
      })
    } catch (notifErr) {
      console.error(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_NOTIFICATION_ERROR',
        error: notifErr.message,
        receiptId: receipt.id,
        timestamp: new Date().toISOString(),
      }))
    }

    // Audit log final
    console.log(JSON.stringify({
      event: 'CHARGILY_WEBHOOK_PAYMENT_APPROVED',
      chargilyCheckoutId,
      userId: receipt.userId,
      courseId: receipt.courseId,
      receiptId: receipt.id,
      amount: receipt.amount,
      instructorEarnings: receipt.instructorEarnings,
      platformCommission: receipt.platformCommission,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))

    return res.status(200).json({ received: true, action: 'access_granted', receiptId: receipt.id })
  } catch (err) {
    console.error(JSON.stringify({
      event: 'CHARGILY_WEBHOOK_UNHANDLED_ERROR',
      error: err.message,
      stack: err.stack?.slice(0, 500),
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }))
    // IMPORTANT: Toujours retourner 200 pour éviter que Chargily ne réessaie indéfiniment
    // L'erreur est loguée pour investigation
    return res.status(200).json({ received: true, action: 'error_logged' })
  }
})

// ============================================================
// STRIPE — Paiement carte internationale
// STATUT: Intégration prête, EN ATTENTE d'ouverture du compte Stripe.
// Tant que STRIPE_SECRET_KEY n'est pas défini, ces routes renvoient 503
// (même garde-fou que Chargily plus haut).
// ============================================================

// ─── POST /api/payments/stripe/checkout ────────────────────────
router.post('/stripe/checkout', authenticate, async (req, res, next) => {
  try {
    const { courseId, couponCode, currency } = req.body
    const userId = req.user.id

    if (!courseId) return res.status(400).json({ error: t('payments.course_id_required', req.lang) })

    if (!stripeService.isConfigured()) {
      console.error(JSON.stringify({
        event: 'STRIPE_NOT_CONFIGURED',
        userId,
        timestamp: new Date().toISOString(),
      }))
      return res.status(503).json({ error: 'Le paiement par carte (Stripe) arrive bientôt.' })
    }

    const parsedCourseId = validateId(courseId)
    if (!parsedCourseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: { id: true, title: true, price: true, discountPrice: true, discountEndsAt: true, instructorId: true },
    })
    if (!course) return res.status(404).json({ error: t('payments.course_not_found', req.lang) })

    const approved = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'APPROVED' },
    })
    if (approved) return res.status(409).json({ error: t('payments.already_access', req.lang) })

    const existingPending = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'PENDING', paymentType: 'STRIPE' },
    })
    if (existingPending) {
      await prisma.receipt.update({
        where: { id: existingPending.id },
        data: { status: 'REJECTED', notes: 'Remplacé par un nouveau checkout Stripe' },
      })
    }

    const { finalPrice, appliedCoupon, instructorEarnings, platformCommission } = await computeOrderPricing(course, couponCode)

    const orderId = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const successUrl = `${frontendUrl}/payment/success?orderId=${orderId}`
    const failureUrl = `${frontendUrl}/payment/failure?orderId=${orderId}`

    const receiptNotes = appliedCoupon
      ? `[COUPON APPLIQUÉ: ${appliedCoupon.code} (-${appliedCoupon.discountPercent}%)] Stripe`
      : 'Stripe'

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        courseId: course.id,
        amount: finalPrice,
        status: 'PENDING',
        paymentType: 'STRIPE',
        transactionId: orderId,
        notes: receiptNotes,
        instructorEarnings,
        platformCommission,
        couponId: appliedCoupon ? appliedCoupon.id : undefined,
      },
    })

    const { checkoutUrl, checkoutId } = await stripeService.createCheckoutSession({
      amount: finalPrice,
      currency: currency || 'usd',
      courseName: course.title,
      orderId,
      userId,
      courseId: course.id,
      successUrl,
      failureUrl,
    })

    await prisma.receipt.update({
      where: { id: receipt.id },
      data: { stripeCheckoutId: checkoutId },
    })

    console.log(JSON.stringify({
      event: 'STRIPE_CHECKOUT_INITIATED',
      userId, courseId: course.id, receiptId: receipt.id, orderId, checkoutId,
      amount: finalPrice, requestId: req.requestId, timestamp: new Date().toISOString(),
    }))

    res.json({ checkoutUrl, orderId, receiptId: receipt.id })
  } catch (err) {
    if (err.message?.includes('Stripe checkout creation failed')) {
      console.error(JSON.stringify({
        event: 'STRIPE_CHECKOUT_ERROR', error: err.message, userId: req.user?.id,
        requestId: req.requestId, timestamp: new Date().toISOString(),
      }))
      return res.status(502).json({ error: 'Erreur de connexion avec Stripe. Réessayez.' })
    }
    next(err)
  }
})

// ─── POST /api/payments/stripe/webhook ─────────────────────────
// Nécessite le raw body (voir server.js) pour la vérification de signature.
router.post('/stripe/webhook', async (req, res) => {
  try {
    const rawBody = req.rawBody || req.body
    const signature = req.headers['stripe-signature']

    const rawBodyStr = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(rawBody))
    if (!stripeService.verifyWebhookSignature(rawBodyStr, signature)) {
      console.warn(JSON.stringify({
        event: 'STRIPE_WEBHOOK_SIGNATURE_INVALID', ip: req.ip,
        requestId: req.requestId, timestamp: new Date().toISOString(),
      }))
      return res.status(401).json({ error: 'Invalid webhook signature.' })
    }

    const payload = Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString('utf8')) : rawBody
    const eventType = payload?.type
    const session = payload?.data?.object

    console.log(JSON.stringify({
      event: 'STRIPE_WEBHOOK_RECEIVED', type: eventType, sessionId: session?.id,
      requestId: req.requestId, timestamp: new Date().toISOString(),
    }))

    if (eventType !== 'checkout.session.completed' || session?.payment_status !== 'paid') {
      return res.status(200).json({ received: true, action: 'none', type: eventType })
    }

    const stripeCheckoutId = session.id
    const receipt = await prisma.receipt.findUnique({
      where: { stripeCheckoutId },
      include: { course: { select: { title: true, instructorId: true } } },
    })

    if (!receipt) {
      console.warn(JSON.stringify({
        event: 'STRIPE_WEBHOOK_RECEIPT_NOT_FOUND', stripeCheckoutId,
        requestId: req.requestId, timestamp: new Date().toISOString(),
      }))
      return res.status(404).json({ error: 'Receipt not found for this checkout.' })
    }

    if (receipt.status !== 'PENDING') {
      return res.status(200).json({ received: true, action: 'already_processed', currentStatus: receipt.status })
    }

    const updateResult = await prisma.receipt.updateMany({
      where: { id: receipt.id, status: 'PENDING' },
      data: { status: 'APPROVED', approvedAt: new Date(), notes: `Auto-approved – Stripe checkout: ${stripeCheckoutId}` },
    })
    if (updateResult.count === 0) {
      return res.status(200).json({ received: true, action: 'already_processed' })
    }

    try {
      const { processReferral } = require('../referralManager')
      await processReferral(receipt.userId, receipt.course.title)
    } catch (refErr) {
      console.error('Stripe webhook referral error', refErr.message)
    }

    if (receipt.course.instructorId && receipt.instructorEarnings) {
      await prisma.user.update({
        where: { id: receipt.course.instructorId },
        data: { instructorBalance: { increment: receipt.instructorEarnings } },
      })
    }

    if (receipt.couponId) {
      await prisma.coupon.updateMany({ where: { id: receipt.couponId }, data: { currentUses: { increment: 1 } } })
    }

    try {
      await prisma.notification.create({
        data: {
          userId: receipt.userId,
          title: 'Paiement confirmé ✅',
          message: `Votre paiement pour "${receipt.course.title}" a été confirmé. Vous pouvez accéder à la formation.`,
          type: 'SUCCESS',
        },
      })
    } catch (notifErr) {
      console.error('Stripe webhook notification error', notifErr.message)
    }

    console.log(JSON.stringify({
      event: 'STRIPE_WEBHOOK_PAYMENT_APPROVED', stripeCheckoutId, receiptId: receipt.id,
      requestId: req.requestId, timestamp: new Date().toISOString(),
    }))

    return res.status(200).json({ received: true, action: 'access_granted', receiptId: receipt.id })
  } catch (err) {
    console.error(JSON.stringify({
      event: 'STRIPE_WEBHOOK_UNHANDLED_ERROR', error: err.message,
      requestId: req.requestId, timestamp: new Date().toISOString(),
    }))
    return res.status(200).json({ received: true, action: 'error_logged' })
  }
})

// ============================================================
// PAYPAL — Paiement international
// STATUT: Intégration prête, EN ATTENTE d'ouverture du compte
// business PayPal. Tant que PAYPAL_CLIENT_ID/SECRET ne sont pas
// définis, ces routes renvoient 503.
// ============================================================

// ─── POST /api/payments/paypal/checkout ────────────────────────
router.post('/paypal/checkout', authenticate, async (req, res, next) => {
  try {
    const { courseId, couponCode, currency } = req.body
    const userId = req.user.id

    if (!courseId) return res.status(400).json({ error: t('payments.course_id_required', req.lang) })

    if (!paypalService.isConfigured()) {
      console.error(JSON.stringify({
        event: 'PAYPAL_NOT_CONFIGURED', userId, timestamp: new Date().toISOString(),
      }))
      return res.status(503).json({ error: 'Le paiement par PayPal arrive bientôt.' })
    }

    const parsedCourseId = validateId(courseId)
    if (!parsedCourseId) return res.status(400).json({ error: t('courses.id_invalid', req.lang) })

    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
      select: { id: true, title: true, price: true, discountPrice: true, discountEndsAt: true, instructorId: true },
    })
    if (!course) return res.status(404).json({ error: t('payments.course_not_found', req.lang) })

    const approved = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'APPROVED' },
    })
    if (approved) return res.status(409).json({ error: t('payments.already_access', req.lang) })

    const existingPending = await prisma.receipt.findFirst({
      where: { userId, courseId: course.id, status: 'PENDING', paymentType: 'PAYPAL' },
    })
    if (existingPending) {
      await prisma.receipt.update({
        where: { id: existingPending.id },
        data: { status: 'REJECTED', notes: 'Remplacé par un nouveau checkout PayPal' },
      })
    }

    const { finalPrice, appliedCoupon, instructorEarnings, platformCommission } = await computeOrderPricing(course, couponCode)

    const orderId = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const successUrl = `${frontendUrl}/payment/success?orderId=${orderId}`
    const failureUrl = `${frontendUrl}/payment/failure?orderId=${orderId}`

    const receiptNotes = appliedCoupon
      ? `[COUPON APPLIQUÉ: ${appliedCoupon.code} (-${appliedCoupon.discountPercent}%)] PayPal`
      : 'PayPal'

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        courseId: course.id,
        amount: finalPrice,
        status: 'PENDING',
        paymentType: 'PAYPAL',
        transactionId: orderId,
        notes: receiptNotes,
        instructorEarnings,
        platformCommission,
        couponId: appliedCoupon ? appliedCoupon.id : undefined,
      },
    })

    const { checkoutUrl, checkoutId } = await paypalService.createOrder({
      amount: finalPrice,
      currency: currency || 'USD',
      courseName: course.title,
      orderId,
      userId,
      courseId: course.id,
      successUrl,
      failureUrl,
    })

    await prisma.receipt.update({
      where: { id: receipt.id },
      data: { paypalOrderId: checkoutId },
    })

    console.log(JSON.stringify({
      event: 'PAYPAL_CHECKOUT_INITIATED',
      userId, courseId: course.id, receiptId: receipt.id, orderId, checkoutId,
      amount: finalPrice, requestId: req.requestId, timestamp: new Date().toISOString(),
    }))

    res.json({ checkoutUrl, orderId, receiptId: receipt.id })
  } catch (err) {
    if (err.message?.includes('PayPal order creation failed')) {
      console.error(JSON.stringify({
        event: 'PAYPAL_CHECKOUT_ERROR', error: err.message, userId: req.user?.id,
        requestId: req.requestId, timestamp: new Date().toISOString(),
      }))
      return res.status(502).json({ error: 'Erreur de connexion avec PayPal. Réessayez.' })
    }
    next(err)
  }
})

// ─── POST /api/payments/paypal/capture ─────────────────────────
// PayPal (contrairement à Stripe/Chargily) exige une capture explicite
// après que l'utilisateur a approuvé le paiement côté PayPal.
router.post('/paypal/capture', authenticate, async (req, res, next) => {
  try {
    const { paypalOrderId } = req.body
    const userId = req.user.id
    if (!paypalOrderId) return res.status(400).json({ error: 'paypalOrderId requis.' })

    const receipt = await prisma.receipt.findUnique({
      where: { paypalOrderId },
      include: { course: { select: { title: true, instructorId: true } } },
    })
    if (!receipt || receipt.userId !== userId) {
      return res.status(404).json({ error: 'Commande PayPal introuvable.' })
    }
    if (receipt.status === 'APPROVED') {
      return res.json({ received: true, action: 'already_processed', receiptId: receipt.id })
    }

    const capture = await paypalService.captureOrder(paypalOrderId)
    if (capture.status !== 'COMPLETED') {
      return res.status(402).json({ error: 'Le paiement PayPal n\'a pas pu être finalisé.' })
    }

    const updateResult = await prisma.receipt.updateMany({
      where: { id: receipt.id, status: 'PENDING' },
      data: { status: 'APPROVED', approvedAt: new Date(), notes: `Auto-approved – PayPal order: ${paypalOrderId}` },
    })
    if (updateResult.count === 0) {
      return res.json({ received: true, action: 'already_processed', receiptId: receipt.id })
    }

    try {
      const { processReferral } = require('../referralManager')
      await processReferral(receipt.userId, receipt.course.title)
    } catch (refErr) {
      console.error('PayPal capture referral error', refErr.message)
    }

    if (receipt.course.instructorId && receipt.instructorEarnings) {
      await prisma.user.update({
        where: { id: receipt.course.instructorId },
        data: { instructorBalance: { increment: receipt.instructorEarnings } },
      })
    }
    if (receipt.couponId) {
      await prisma.coupon.updateMany({ where: { id: receipt.couponId }, data: { currentUses: { increment: 1 } } })
    }

    console.log(JSON.stringify({
      event: 'PAYPAL_CAPTURE_APPROVED', paypalOrderId, receiptId: receipt.id,
      requestId: req.requestId, timestamp: new Date().toISOString(),
    }))

    res.json({ received: true, action: 'access_granted', receiptId: receipt.id })
  } catch (err) { next(err) }
})

// ─── POST /api/payments/paypal/webhook ─────────────────────────
// Filet de sécurité si l'utilisateur ferme l'onglet avant le retour
// vers /paypal/capture (PayPal notifie quand même l'événement).
router.post('/paypal/webhook', async (req, res) => {
  try {
    const payload = req.body
    const isValid = await paypalService.verifyWebhookSignature(req.headers, payload)
    if (!isValid) {
      console.warn(JSON.stringify({
        event: 'PAYPAL_WEBHOOK_SIGNATURE_INVALID', ip: req.ip,
        requestId: req.requestId, timestamp: new Date().toISOString(),
      }))
      return res.status(401).json({ error: 'Invalid webhook signature.' })
    }

    const eventType = payload?.event_type
    console.log(JSON.stringify({
      event: 'PAYPAL_WEBHOOK_RECEIVED', type: eventType,
      requestId: req.requestId, timestamp: new Date().toISOString(),
    }))

    if (eventType !== 'CHECKOUT.ORDER.APPROVED' && eventType !== 'PAYMENT.CAPTURE.COMPLETED') {
      return res.status(200).json({ received: true, action: 'none', type: eventType })
    }

    const paypalOrderId = payload?.resource?.id || payload?.resource?.supplementary_data?.related_ids?.order_id
    if (!paypalOrderId) {
      return res.status(200).json({ received: true, action: 'none' })
    }

    const receipt = await prisma.receipt.findUnique({
      where: { paypalOrderId },
      include: { course: { select: { title: true, instructorId: true } } },
    })
    if (!receipt || receipt.status !== 'PENDING') {
      return res.status(200).json({ received: true, action: 'none' })
    }

    const updateResult = await prisma.receipt.updateMany({
      where: { id: receipt.id, status: 'PENDING' },
      data: { status: 'APPROVED', approvedAt: new Date(), notes: `Auto-approved – PayPal webhook: ${paypalOrderId}` },
    })
    if (updateResult.count === 0) {
      return res.status(200).json({ received: true, action: 'already_processed' })
    }

    try {
      const { processReferral } = require('../referralManager')
      await processReferral(receipt.userId, receipt.course.title)
    } catch (refErr) {
      console.error('PayPal webhook referral error', refErr.message)
    }

    if (receipt.course.instructorId && receipt.instructorEarnings) {
      await prisma.user.update({
        where: { id: receipt.course.instructorId },
        data: { instructorBalance: { increment: receipt.instructorEarnings } },
      })
    }

    console.log(JSON.stringify({
      event: 'PAYPAL_WEBHOOK_PAYMENT_APPROVED', paypalOrderId, receiptId: receipt.id,
      requestId: req.requestId, timestamp: new Date().toISOString(),
    }))

    return res.status(200).json({ received: true, action: 'access_granted', receiptId: receipt.id })
  } catch (err) {
    console.error(JSON.stringify({
      event: 'PAYPAL_WEBHOOK_UNHANDLED_ERROR', error: err.message,
      requestId: req.requestId, timestamp: new Date().toISOString(),
    }))
    return res.status(200).json({ received: true, action: 'error_logged' })
  }
})

module.exports = router
