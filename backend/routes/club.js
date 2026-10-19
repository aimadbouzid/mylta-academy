// ============================================================
// CLUB SCIENTIFIQUE — Université de Béjaïa (Targa Ouzemmour)
// Inscriptions aux trois formations gratuites, et espace de
// consultation pour les organisateurs.
//
// Cet espace vit à part du reste du site : les organisateurs
// entrent un mot de passe partagé (CLUB_ADMIN_PASSWORD) et ne
// voient que les inscrits à ces formations — ni les élèves de
// l'académie, ni les paiements, ni les réglages.
// ============================================================

const crypto = require('crypto')
const express = require('express')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const prisma = require('../prisma')
const { TRAININGS, SLUGS } = require('../utils/clubTrainings')
const { notifyOwner } = require('../utils/notifyOwner')

const router = express.Router()

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(40),
  lastName: z.string().trim().min(2).max(40),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,20}$/),
  training: z.enum(SLUGS),
  website: z.string().optional(), // piège à robots
})

// Comparaison à durée constante : un mot de passe ne se devine pas au
// chronomètre, même sur un espace aussi modeste que celui-ci.
const sameSecret = (a, b) => {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

const requireOrganizer = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Connectez-vous pour voir les inscriptions.' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.scope !== 'club') throw new Error('scope')
    next()
  } catch {
    return res.status(401).json({ error: 'Session expirée. Entrez à nouveau le mot de passe.' })
  }
}

// GET /api/club/trainings — la liste, pour la page publique
router.get('/trainings', (req, res) => res.json({ trainings: TRAININGS }))

// POST /api/club/register — un numéro ne s'inscrit qu'une fois par formation
router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Vérifiez votre nom, votre prénom et votre numéro de téléphone.' })
    }
    const { firstName, lastName, phone, training, website } = parsed.data
    if (website) return res.status(201).json({ ok: true })

    const digits = phone.replace(/\D/g, '')
    const exists = await prisma.clubRegistration.findUnique({
      where: { phone_training: { phone: digits, training } },
    })
    if (exists) return res.status(409).json({ error: 'Ce numéro est déjà inscrit à cette formation.' })

    await prisma.clubRegistration.create({
      data: { firstName, lastName, phone: digits, training, ip: String(req.ip || '').slice(0, 45) },
    })
    const label = TRAININGS.find(t => t.slug === training)?.title || training
    notifyOwner(`🎓 Club université — ${firstName} ${lastName} (${phone}) s'inscrit à « ${label} »`)
    res.status(201).json({ ok: true })
  } catch (err) { next(err) }
})

// POST /api/club/access — mot de passe partagé des organisateurs
router.post('/access', (req, res) => {
  const expected = process.env.CLUB_ADMIN_PASSWORD
  if (!expected) {
    return res.status(503).json({ error: "L'espace organisateurs n'est pas encore configuré." })
  }
  if (!sameSecret(req.body?.password || '', expected)) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' })
  }
  const token = jwt.sign({ scope: 'club' }, process.env.JWT_SECRET, { expiresIn: '12h' })
  res.json({ token })
})

// GET /api/club/registrations — compteurs et liste, réservés aux organisateurs
router.get('/registrations', requireOrganizer, async (req, res, next) => {
  try {
    const rows = await prisma.clubRegistration.findMany({ orderBy: { createdAt: 'desc' } })
    const counts = TRAININGS.map(t => ({
      ...t,
      count: rows.filter(r => r.training === t.slug).length,
    }))
    res.json({
      total: rows.length,
      counts,
      registrations: rows.map(({ ip, ...r }) => r),
    })
  } catch (err) { next(err) }
})

module.exports = router
