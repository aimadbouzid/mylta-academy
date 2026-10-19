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
const fs = require('fs')
const path = require('path')
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
  club: z.string().trim().max(60).optional().default(''),
  website: z.string().optional(), // piège à robots
})

// ─── Logos des clubs ─────────────────────────────────────────
// L'image arrive déjà réduite et recompressée par le navigateur de
// l'organisateur : le serveur n'a donc pas besoin de sharp ni d'un binaire
// natif. Il vérifie le format, plafonne la taille, et écrit le fichier.
const CLUBS_DIR = path.join(__dirname, '..', 'uploads', 'clubs')
const LOGO_TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }
const LOGO_MAX_BYTES = 400 * 1024

const saveLogo = (dataUrl) => {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(String(dataUrl || ''))
  if (!match) throw Object.assign(new Error('bad-image'), { status: 400 })
  const ext = LOGO_TYPES[match[1]]
  if (!ext) throw Object.assign(new Error('bad-type'), { status: 400 })
  const buffer = Buffer.from(match[2], 'base64')
  if (!buffer.length || buffer.length > LOGO_MAX_BYTES) throw Object.assign(new Error('too-big'), { status: 413 })

  fs.mkdirSync(CLUBS_DIR, { recursive: true })
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(5).toString('hex')}.${ext}`
  fs.writeFileSync(path.join(CLUBS_DIR, name), buffer)
  return `/uploads/clubs/${name}`
}

// Le fichier remplacé ou supprimé ne sert plus à rien : on le retire, sans
// faire échouer l'opération si le disque a déjà été nettoyé à la main.
const dropLogo = (logo) => {
  if (!logo?.startsWith('/uploads/clubs/')) return
  try { fs.unlinkSync(path.join(CLUBS_DIR, path.basename(logo))) } catch { /* déjà absent */ }
}

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

// Jeton du QR code : court, aléatoire, sans lien avec l'identité de la
// personne. Préfixé dans le QR pour qu'un scan étranger soit rejeté tout de
// suite, et qu'un appareil photo ordinaire affiche quelque chose de parlant.
const QR_PREFIX = 'MYLTA-CLUB:'
const newToken = () => crypto.randomBytes(8).toString('hex')
const readToken = (raw) => String(raw || '').trim().replace(QR_PREFIX, '').trim()

// GET /api/club/trainings — la liste, pour la page publique
router.get('/trainings', (req, res) => res.json({ trainings: TRAININGS, qrPrefix: QR_PREFIX }))

// GET /api/club/groups — les clubs proposés à l'inscription
router.get('/groups', async (req, res, next) => {
  try {
    const groups = await prisma.clubGroup.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, logo: true },
    })
    res.json({ groups })
  } catch (err) { next(err) }
})

// ─── Gestion des clubs, réservée aux organisateurs ───────────
router.get('/groups/all', requireOrganizer, async (req, res, next) => {
  try {
    const groups = await prisma.clubGroup.findMany({ orderBy: { name: 'asc' } })
    res.json({ groups })
  } catch (err) { next(err) }
})

router.post('/groups', requireOrganizer, async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim().slice(0, 60)
    if (name.length < 2) return res.status(400).json({ error: 'Donnez un nom au club.' })
    const taken = await prisma.clubGroup.findUnique({ where: { name } })
    if (taken) return res.status(409).json({ error: 'Ce club existe déjà.' })

    const logo = req.body?.logo ? saveLogo(req.body.logo) : ''
    const group = await prisma.clubGroup.create({ data: { name, logo } })
    res.status(201).json({ group })
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: "Image illisible. Choisissez une photo JPEG, PNG ou WebP." })
    if (err.status === 413) return res.status(413).json({ error: 'Image trop lourde.' })
    next(err)
  }
})

router.patch('/groups/:id', requireOrganizer, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const group = await prisma.clubGroup.findUnique({ where: { id } })
    if (!group) return res.status(404).json({ error: 'Club introuvable.' })

    const data = {}
    if (typeof req.body?.name === 'string') {
      const name = req.body.name.trim().slice(0, 60)
      if (name.length < 2) return res.status(400).json({ error: 'Donnez un nom au club.' })
      data.name = name
    }
    if (typeof req.body?.active === 'boolean') data.active = req.body.active
    if (req.body?.logo) {
      data.logo = saveLogo(req.body.logo)
      dropLogo(group.logo)
    }

    const saved = await prisma.clubGroup.update({ where: { id }, data })
    res.json({ group: saved })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ce nom est déjà pris.' })
    if (err.status === 400) return res.status(400).json({ error: "Image illisible. Choisissez une photo JPEG, PNG ou WebP." })
    if (err.status === 413) return res.status(413).json({ error: 'Image trop lourde.' })
    next(err)
  }
})

router.delete('/groups/:id', requireOrganizer, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const group = await prisma.clubGroup.findUnique({ where: { id } })
    if (!group) return res.status(404).json({ error: 'Club introuvable.' })
    // Les inscriptions gardent le nom du club : retirer un club de la liste
    // n'efface personne.
    await prisma.clubGroup.delete({ where: { id } })
    dropLogo(group.logo)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// POST /api/club/register — un numéro ne s'inscrit qu'une fois par formation
router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Vérifiez votre nom, votre prénom et votre numéro de téléphone.' })
    }
    const { firstName, lastName, phone, training, club, website } = parsed.data
    if (website) return res.status(201).json({ ok: true })

    const digits = phone.replace(/\D/g, '')
    const exists = await prisma.clubRegistration.findUnique({
      where: { phone_training: { phone: digits, training } },
    })
    // Déjà inscrit : on renvoie son billet plutôt qu'une erreur sèche. La
    // plupart de ceux qui recommencent ont simplement perdu leur QR code.
    if (exists) {
      return res.status(200).json({ ok: true, already: true, token: exists.token, qr: QR_PREFIX + exists.token })
    }

    const created = await prisma.clubRegistration.create({
      data: {
        firstName, lastName, phone: digits, training, club,
        token: newToken(),
        ip: String(req.ip || '').slice(0, 45),
      },
    })
    const label = TRAININGS.find(t => t.slug === training)?.title || training
    notifyOwner(`🎓 Club université — ${firstName} ${lastName} (${phone}) s'inscrit à « ${label} »`)
    res.status(201).json({ ok: true, token: created.token, qr: QR_PREFIX + created.token })
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
    const counts = TRAININGS.map(t => {
      const mine = rows.filter(r => r.training === t.slug)
      return { ...t, count: mine.length, present: mine.filter(r => r.checkedInAt).length }
    })
    res.json({
      total: rows.length,
      present: rows.filter(r => r.checkedInAt).length,
      counts,
      registrations: rows.map(({ ip, ...r }) => r),
    })
  } catch (err) { next(err) }
})

// POST /api/club/checkin — pointage à l'entrée, par scan du QR ou à la main.
// `present` absent : on bascule. Présent/absent se corrige autant de fois
// qu'il le faut, une erreur de scan n'enferme personne.
router.post('/checkin', requireOrganizer, async (req, res, next) => {
  try {
    const { token, id, present } = req.body || {}
    const where = token ? { token: readToken(token) } : id ? { id: Number(id) } : null
    if (!where || (where.token === '' ) || (where.id !== undefined && !Number.isInteger(where.id))) {
      return res.status(400).json({ error: 'QR code illisible.' })
    }

    const row = await prisma.clubRegistration.findUnique({ where })
    if (!row) return res.status(404).json({ error: "Ce QR code ne correspond à aucune inscription." })

    const next_ = typeof present === 'boolean' ? present : !row.checkedInAt
    const saved = await prisma.clubRegistration.update({
      where: { id: row.id },
      data: { checkedInAt: next_ ? new Date() : null },
    })
    const label = TRAININGS.find(t => t.slug === saved.training)?.title || saved.training
    res.json({
      ok: true,
      present: Boolean(saved.checkedInAt),
      alreadyIn: next_ && Boolean(row.checkedInAt),
      registration: { id: saved.id, firstName: saved.firstName, lastName: saved.lastName, training: saved.training, trainingTitle: label, checkedInAt: saved.checkedInAt },
    })
  } catch (err) { next(err) }
})

module.exports = router
