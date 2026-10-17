const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma')
const { notifyOwner } = require('../utils/notifyOwner')

const router = express.Router()

const publicFields = { id: true, fullName: true, role: true, text: true, createdAt: true }

// GET /api/reviews — avis publiés (les plus récents d'abord)
router.get('/', async (req, res, next) => {
  try {
    const reviews = await prisma.siteReview.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: publicFields,
    })
    res.setHeader('Cache-Control', 'no-store')
    res.json({ reviews })
  } catch (err) { next(err) }
})

const reviewSchema = z.object({
  fullName: z.string().trim().min(2).max(40),
  role: z.string().trim().max(40).optional().default(''),
  text: z.string().trim().min(10).max(400),
  website: z.string().optional(), // piège à robots : toujours vide pour un humain
})

// Liens et numéros : signe de spam, refusés pour garder des avis propres.
const SPAM_RE = /(https?:\/\/|www\.|\.(com|net|org|xyz|ru|io|dz)\b|@|\d{8,})/i

// POST /api/reviews — publication immédiate, l'admin peut masquer ou supprimer
router.post('/', async (req, res, next) => {
  try {
    const parsed = reviewSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Écrivez votre prénom et un avis d\'au moins 10 caractères.' })
    const { fullName, role, text, website } = parsed.data
    if (website) return res.status(201).json({ review: { id: 0, fullName, role, text, createdAt: new Date() } })
    if (SPAM_RE.test(`${fullName} ${role} ${text}`)) {
      return res.status(400).json({ error: 'Les liens, e-mails et numéros ne sont pas acceptés dans les avis.' })
    }
    const ip = String(req.ip || '').slice(0, 45)
    // Plafond par connexion (plusieurs abonnés mobiles peuvent partager une IP).
    const recent = await prisma.siteReview.count({ where: { ip, createdAt: { gte: new Date(Date.now() - 3600000) } } })
    if (recent >= 5) return res.status(429).json({ error: 'Trop d\'avis depuis cette connexion. Réessayez plus tard.' })

    const review = await prisma.siteReview.create({ data: { fullName, role, text, ip }, select: publicFields })
    notifyOwner(`💬 Nouvel avis sur le site — ${fullName}${role ? ` (${role})` : ''} :\n${text}`)
    res.status(201).json({ review })
  } catch (err) { next(err) }
})

module.exports = router
