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
    // Même porte, deux billetteries : si le jeton n'est pas celui d'une des
    // trois formations, c'est celui d'un événement du club.
    if (!row) {
      if (where.id !== undefined) return res.status(404).json({ error: "Ce QR code ne correspond à aucune inscription." })
      const evRow = await prisma.clubEventRegistration.findUnique({ where, include: { event: true } })
      if (!evRow) return res.status(404).json({ error: "Ce QR code ne correspond à aucune inscription." })
      const want = typeof present === 'boolean' ? present : !evRow.checkedInAt
      const savedEv = await prisma.clubEventRegistration.update({
        where: { id: evRow.id },
        data: { checkedInAt: want ? new Date() : null },
      })
      return res.json({
        ok: true,
        present: Boolean(savedEv.checkedInAt),
        alreadyIn: want && Boolean(evRow.checkedInAt),
        registration: {
          id: savedEv.id, firstName: savedEv.firstName, lastName: savedEv.lastName,
          training: `event:${evRow.event.slug}`, trainingTitle: evRow.event.title,
          checkedInAt: savedEv.checkedInAt,
        },
      })
    }

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

// ════════════════════════════════════════════════════════════
// ÉVÉNEMENTS DU CLUB — open days, ateliers, rencontres
// ════════════════════════════════════════════════════════════

// Un titre devient une adresse lisible : « Open Day IA » → « open-day-ia ».
const slugify = (s) => String(s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)

const programmeSchema = z.array(z.object({
  time: z.string().trim().max(10).optional().default(''),
  label: z.string().trim().min(1).max(120),
})).max(30)

// Aucune valeur par défaut ici : avec `.default()`, une modification partielle
// remettait en brouillon et effaçait l'heure ou le lieu qu'on n'avait pas
// renvoyés. Les défauts s'appliquent à la création, dans la route.
const eventShape = {
  title: z.string().trim().min(3).max(100),
  summary: z.string().trim().max(300),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).or(z.literal('')),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).or(z.literal('')),
  place: z.string().trim().max(120),
  capacity: z.number().int().min(0).max(5000),
  published: z.boolean(),
  programme: programmeSchema,
  poster: z.string(), // data URL ; absent = on garde l'affiche actuelle
}
// Création : le titre et la date sont exigés, le reste est facultatif.
const createEventSchema = z.object(eventShape).partial().required({ title: true, date: true })
// Modification : uniquement ce que l'organisateur renvoie.
const patchEventSchema = z.object(eventShape).partial()

// Ce que le public a le droit de voir d'un événement.
const publicEvent = (e, taken = 0) => ({
  id: e.id, slug: e.slug, title: e.title, summary: e.summary,
  date: e.date, startTime: e.startTime, endTime: e.endTime,
  place: e.place, poster: e.poster, capacity: e.capacity,
  programme: Array.isArray(e.programme) ? e.programme : [],
  seatsLeft: e.capacity > 0 ? Math.max(0, e.capacity - taken) : null,
  registered: taken,
})

const today = () => new Date().toISOString().slice(0, 10)

// ─── GET /api/club/events — à venir, publiés ─────────────────
router.get('/events', async (req, res, next) => {
  try {
    const events = await prisma.clubEvent.findMany({
      where: { published: true, date: { gte: today() } },
      orderBy: { date: 'asc' },
      include: { _count: { select: { registrations: true } } },
    })
    res.setHeader('Cache-Control', 'no-store')
    res.json({ events: events.map(e => publicEvent(e, e._count.registrations)) })
  } catch (err) { next(err) }
})

// ─── GET /api/club/events/:slug — fiche publique ─────────────
router.get('/events/:slug', async (req, res, next) => {
  try {
    const event = await prisma.clubEvent.findUnique({
      where: { slug: String(req.params.slug) },
      include: { _count: { select: { registrations: true } } },
    })
    if (!event || !event.published) return res.status(404).json({ error: 'Événement introuvable.' })
    res.setHeader('Cache-Control', 'no-store')
    res.json({ event: publicEvent(event, event._count.registrations) })
  } catch (err) { next(err) }
})

// ─── POST /api/club/events/:slug/register — inscription ──────
router.post('/events/:slug/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.omit({ training: true }).safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Vérifiez votre nom, votre prénom et votre numéro de téléphone.' })
    }
    const { firstName, lastName, phone, club, website } = parsed.data
    if (website) return res.status(201).json({ ok: true })

    const event = await prisma.clubEvent.findUnique({
      where: { slug: String(req.params.slug) },
      include: { _count: { select: { registrations: true } } },
    })
    if (!event || !event.published) return res.status(404).json({ error: 'Événement introuvable.' })
    if (event.date < today()) return res.status(400).json({ error: 'Cet événement est passé.' })

    const digits = phone.replace(/\D/g, '')
    const exists = await prisma.clubEventRegistration.findUnique({
      where: { phone_eventId: { phone: digits, eventId: event.id } },
    })
    // Déjà inscrit : on lui rend son billet plutôt qu'une erreur sèche.
    if (exists) {
      return res.status(200).json({ ok: true, already: true, token: exists.token, qr: QR_PREFIX + exists.token })
    }
    // La place se vérifie après le doublon : un inscrit qui revient doit
    // retrouver son billet même quand l'événement affiche complet.
    if (event.capacity > 0 && event._count.registrations >= event.capacity) {
      return res.status(409).json({ error: 'Plus de places pour cet événement.' })
    }

    const created = await prisma.clubEventRegistration.create({
      data: {
        eventId: event.id, firstName, lastName, phone: digits, club,
        token: newToken(),
        ip: String(req.ip || '').slice(0, 45),
      },
    })
    notifyOwner(`📅 ${event.title} — ${firstName} ${lastName} (${phone}) s'inscrit`)
    res.status(201).json({ ok: true, token: created.token, qr: QR_PREFIX + created.token })
  } catch (err) { next(err) }
})

// ─── Gestion des événements, réservée aux organisateurs ──────
router.get('/events-admin/all', requireOrganizer, async (req, res, next) => {
  try {
    const events = await prisma.clubEvent.findMany({
      orderBy: { date: 'desc' },
      include: { _count: { select: { registrations: true } } },
    })
    res.json({
      events: events.map(e => ({
        ...publicEvent(e, e._count.registrations),
        published: e.published,
      })),
    })
  } catch (err) { next(err) }
})

// Un slug libre, dérivé du titre : « open-day », puis « open-day-2 ».
const freeSlug = async (title, selfId = null) => {
  const base = slugify(title) || 'evenement'
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`
    const taken = await prisma.clubEvent.findUnique({ where: { slug }, select: { id: true } })
    if (!taken || taken.id === selfId) return slug
  }
  return `${base}-${crypto.randomBytes(3).toString('hex')}`
}

router.post('/events-admin', requireOrganizer, async (req, res, next) => {
  try {
    const parsed = createEventSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Vérifiez le titre et la date.' })
    const { poster, ...data } = parsed.data

    const event = await prisma.clubEvent.create({
      data: {
        title: data.title,
        date: data.date,
        summary: data.summary ?? '',
        startTime: data.startTime ?? '',
        endTime: data.endTime ?? '',
        place: data.place ?? '',
        capacity: data.capacity ?? 0,
        published: data.published ?? false,
        programme: data.programme ?? [],
        slug: await freeSlug(data.title),
        poster: poster ? saveLogo(poster) : '',
      },
    })
    res.status(201).json({ event: { ...publicEvent(event, 0), published: event.published } })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: "Affiche illisible ou trop lourde (400 Ko maximum)." })
    next(err)
  }
})

router.patch('/events-admin/:id', requireOrganizer, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Identifiant invalide.' })
    const current = await prisma.clubEvent.findUnique({ where: { id } })
    if (!current) return res.status(404).json({ error: 'Événement introuvable.' })

    const parsed = patchEventSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Vérifiez les informations saisies.' })
    const { poster, ...data } = parsed.data

    // Nouvelle affiche : on écrit la nouvelle avant de retirer l'ancienne,
    // pour ne pas laisser l'événement sans image si l'écriture échoue.
    let posterPath
    if (typeof poster === 'string') {
      posterPath = poster ? saveLogo(poster) : ''
      if (current.poster) dropLogo(current.poster)
    }

    const event = await prisma.clubEvent.update({
      where: { id },
      data: {
        ...data,
        ...(data.title ? { slug: await freeSlug(data.title, id) } : {}),
        ...(posterPath !== undefined ? { poster: posterPath } : {}),
      },
      include: { _count: { select: { registrations: true } } },
    })
    res.json({ event: { ...publicEvent(event, event._count.registrations), published: event.published } })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: "Affiche illisible ou trop lourde (400 Ko maximum)." })
    next(err)
  }
})

router.delete('/events-admin/:id', requireOrganizer, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Identifiant invalide.' })
    const event = await prisma.clubEvent.findUnique({ where: { id } })
    if (!event) return res.status(404).json({ error: 'Événement introuvable.' })
    // Les inscriptions partent avec l'événement (cascade) : on prévient.
    await prisma.clubEvent.delete({ where: { id } })
    if (event.poster) dropLogo(event.poster)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.get('/events-admin/:id/registrations', requireOrganizer, async (req, res, next) => {
  try {
    const eventId = Number(req.params.id)
    if (!Number.isInteger(eventId)) return res.status(400).json({ error: 'Identifiant invalide.' })
    const rows = await prisma.clubEventRegistration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    })
    res.json({
      total: rows.length,
      present: rows.filter(r => r.checkedInAt).length,
      registrations: rows.map(({ ip, ...r }) => r),
    })
  } catch (err) { next(err) }
})

module.exports = router
