const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma')
const { getSettings } = require('../settingsManager')
const { notifyOwner } = require('../utils/notifyOwner')
const { notifyRegistration, describe } = require('../utils/registrations')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Carte étudiante : image déjà compressée par le navigateur, envoyée en data URL.
// Rangée avec les pièces d'identité (dossier réservé à l'admin).
const CARD_DIR = path.join(__dirname, '../uploads/identities')
const CARD_TYPES = { 'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png' }
function saveStudentCard(dataUrl) {
  const m = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '')
  if (!m) return null
  const buf = Buffer.from(m[2], 'base64')
  const magicOk = (m[1] === 'image/png' && buf.subarray(0, 4).toString('hex') === '89504e47')
    || (m[1] === 'image/jpeg' && buf[0] === 0xff && buf[1] === 0xd8)
    || (m[1] === 'image/webp' && buf.subarray(8, 12).toString() === 'WEBP')
  if (!magicOk || buf.length > 700 * 1024) return null
  if (!fs.existsSync(CARD_DIR)) fs.mkdirSync(CARD_DIR, { recursive: true })
  const name = `student-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${CARD_TYPES[m[1]]}`
  fs.writeFileSync(path.join(CARD_DIR, name), buf)
  return `/uploads/identities/${name}`
}
const { createPhoneAccount, AccountExistsError } = require('../utils/phoneAccount')

const router = express.Router()

const today = () => new Date().toISOString().slice(0, 10)

const activeRegistrations = { where: { status: { not: 'CANCELLED' } } }

// GET /api/in-person/sessions — prochaines sessions ouvertes et places restantes
router.get('/sessions', async (req, res, next) => {
  try {
    if (!getSettings().inPerson.enabled) return res.status(404).json({ error: 'Coaching présentiel indisponible.' })

    const sessions = await prisma.inPersonSession.findMany({
      where: { isOpen: true, date: { gte: today() } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      select: {
        id: true, title: true, date: true, startTime: true, endTime: true,
        city: true, place: true, capacity: true, price: true,
        _count: { select: { registrations: activeRegistrations } },
      },
    })
    res.setHeader('Cache-Control', 'no-store')
    res.json({
      sessions: sessions.map(({ _count, ...s }) => ({ ...s, seatsLeft: Math.max(0, s.capacity - _count.registrations) })),
    })
  } catch (err) { next(err) }
})

const registerSchema = z.object({
  fullName: z.string().trim().min(3).max(80),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,20}$/),
  city: z.string().trim().max(60).optional().default(''),
  message: z.string().trim().max(500).optional(),
  sessionId: z.number().int().positive().nullable().optional(),
  profile: z.record(z.string().max(40), z.string().max(60)).optional().default({}),
  accepted: z.boolean().optional(),
  website: z.string().optional(), // piège à robots : toujours vide pour un humain
  isStudent: z.boolean().optional().default(false),
  studentCard: z.string().max(950000).optional(),
})

// Questions du profil, dans l'ordre d'affichage (même liste côté page).
const PROFILE_LABELS = { level: 'Niveau', goal: 'Objectif', phoneType: 'Smartphone', capcut: 'CapCut' }

class SessionError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

// POST /api/in-person/register — inscription à une session, ou liste d'attente sans session
router.post('/register', async (req, res, next) => {
  try {
    if (!getSettings().inPerson.enabled) return res.status(404).json({ error: 'Coaching présentiel indisponible.' })

    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Vérifiez votre nom et votre numéro de téléphone.' })
    }
    const { fullName, phone, city, message, sessionId, profile, accepted, website, isStudent } = parsed.data
    if (website) return res.status(201).json({ registration: { id: 0, session: null } })
    if (sessionId && accepted !== true) {
      return res.status(400).json({ error: 'Merci d\'accepter les conditions de participation.' })
    }
    const profileText = Object.entries(PROFILE_LABELS)
      .filter(([key]) => profile[key])
      .map(([key, label]) => `${label} : ${profile[key]}`)
      .join(' · ')
    const settings = getSettings()
    const studentRate = isStudent && Number(settings.inPerson.studentPrice) > 0
    let studentCard = null
    if (studentRate) {
      studentCard = saveStudentCard(parsed.data.studentCard)
      if (!studentCard) return res.status(400).json({ error: 'Ajoutez une photo lisible de votre carte étudiante.' })
    }
    const data = { fullName, phone, city, profile: profileText, message: message || null, ip: String(req.ip || '').slice(0, 45), isStudent: !!studentRate, studentCard }

    // Une même personne (même numéro) ne s'inscrit qu'une fois par session / liste d'attente.
    const normalizedPhone = phone.replace(/\D/g, '')
    const existing = await prisma.inPersonRegistration.findMany({
      where: { sessionId: sessionId || null, formation: '', status: { not: 'CANCELLED' } },
      select: { phone: true },
    })
    if (existing.some(r => r.phone.replace(/\D/g, '') === normalizedPhone)) {
      return res.status(409).json({ error: sessionId
        ? 'Vous êtes déjà inscrit à cette session. Écrivez-nous sur WhatsApp si besoin.'
        : "Vous êtes déjà sur la liste d'attente : on vous prévient dès qu'une date est fixée." })
    }

    const notify = (id, session) => notifyOwner(
      `📍 ${session ? 'Nouvelle inscription' : "Nouvelle demande (liste d'attente)"} — coaching présentiel n°${id}\n` +
      `Nom : ${fullName}\nTél : ${phone}${city ? `\nVille : ${city}` : ''}` +
      (studentRate ? `\n🎓 Tarif étudiant (${settings.inPerson.studentPrice} DA) — carte : ${process.env.SITE_URL || ''}${studentCard}` : '') +
      (session ? `\nSession : ${session.date}${session.city ? ` — ${session.city}` : ''}\nAcompte : en attente` : '') +
      (profileText ? `\n${profileText}` : '') +
      (message ? `\nMessage : ${message}` : '')
    )

    if (!sessionId) {
      const registration = await prisma.inPersonRegistration.create({ data })
      notify(registration.id, null)
      notifyRegistration(phone, describe.inPerson(registration))
      return res.status(201).json({ registration: { id: registration.id, session: null } })
    }

    // Verrou sur la session : deux inscriptions simultanées ne peuvent pas
    // prendre la dernière place en même temps.
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "InPersonSession" WHERE id = ${sessionId} FOR UPDATE`
      const session = await tx.inPersonSession.findUnique({
        where: { id: sessionId },
        include: { _count: { select: { registrations: activeRegistrations } } },
      })
      if (!session || !session.isOpen || session.date < today()) {
        throw new SessionError(400, "Cette session n'est plus disponible.")
      }
      if (session._count.registrations >= session.capacity) {
        throw new SessionError(409, 'Cette session est complète. Choisissez-en une autre ou rejoignez la liste d\'attente.')
      }
      const registration = await tx.inPersonRegistration.create({ data: { ...data, sessionId } })
      const { _count, ...publicSession } = session
      return { id: registration.id, session: publicSession }
    })

    notify(result.id, result.session)
    notifyRegistration(phone, describe.inPerson({ ...data, formation: '', session: result.session }))
    res.status(201).json({ registration: result })
  } catch (err) {
    if (err instanceof SessionError) return res.status(err.status).json({ error: err.message })
    next(err)
  }
})

// ─── Formation d'un jour (chaque samedi) ─────────────────────
const isoDay = (d) => d.toISOString().slice(0, 10)

// Prochains jours de formation (ex. samedis) encore ouverts, du plus proche au plus lointain.
function expressDays(cfg) {
  const out = []
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  // Le jour même, plus d'inscription une fois la formation commencée.
  const [h, m] = String(cfg.startTime || '09:00').split(':').map(Number)
  const startedToday = now.getUTCHours() + 1 > h || (now.getUTCHours() + 1 === h && now.getUTCMinutes() >= m) // heure d'Alger = UTC+1
  for (let i = 0; out.length < (Number(cfg.weeksAhead) || 6) && i < 120; i++) {
    const day = new Date(d.getTime() + i * 86400000)
    if (day.getUTCDay() !== Number(cfg.weekday ?? 6)) continue
    const iso = isoDay(day)
    if (i === 0 && startedToday) continue
    if ((cfg.closedDates || []).includes(iso)) continue
    out.push(iso)
  }
  return out
}

const expressActive = { formation: 'express', status: { not: 'CANCELLED' } }

// GET /api/in-person/express/days — samedis proposés et places restantes
router.get('/express/days', async (req, res, next) => {
  try {
    const cfg = getSettings().express
    if (!cfg?.enabled) return res.status(404).json({ error: 'Formation indisponible.' })
    const days = expressDays(cfg)
    const counts = await prisma.inPersonRegistration.groupBy({
      by: ['day'], where: { ...expressActive, day: { in: days } }, _count: { _all: true },
    })
    const taken = Object.fromEntries(counts.map(c => [c.day, c._count._all]))
    res.setHeader('Cache-Control', 'no-store')
    res.json({ days: days.map(day => ({ day, seatsLeft: Math.max(0, (Number(cfg.capacity) || 12) - (taken[day] || 0)) })) })
  } catch (err) { next(err) }
})

const expressSchema = z.object({
  fullName: z.string().trim().min(3).max(80),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,20}$/),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  message: z.string().trim().max(500).optional(),
  website: z.string().optional(), // piège à robots
})

// POST /api/in-person/express/register — réserver sa place un samedi
router.post('/express/register', async (req, res, next) => {
  try {
    const cfg = getSettings().express
    if (!cfg?.enabled) return res.status(404).json({ error: 'Formation indisponible.' })
    const parsed = expressSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Vérifiez votre nom, votre numéro et la date choisie.' })
    const { fullName, phone, day, message, website } = parsed.data
    if (website) return res.status(201).json({ registration: { id: 0, day } })
    if (!expressDays(cfg).includes(day)) return res.status(400).json({ error: "Cette date n'est plus disponible. Choisissez un autre samedi." })

    const digits = phone.replace(/\D/g, '')
    const capacity = Number(cfg.capacity) || 12
    const result = await prisma.$transaction(async (tx) => {
      // Verrou par date : deux inscriptions simultanées ne prennent pas la dernière place ensemble.
      const lockKey = Number(day.replace(/-/g, ''))
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`
      const regs = await tx.inPersonRegistration.findMany({ where: { ...expressActive, day }, select: { phone: true } })
      if (regs.some(r => r.phone.replace(/\D/g, '') === digits)) throw new SessionError(409, 'Vous êtes déjà inscrit à ce samedi. Écrivez-nous sur WhatsApp si besoin.')
      if (regs.length >= capacity) throw new SessionError(409, 'Ce samedi est complet. Choisissez-en un autre.')
      return tx.inPersonRegistration.create({
        data: { fullName, phone, day, formation: 'express', message: message || null, ip: String(req.ip || '').slice(0, 45) },
      })
    })

    notifyRegistration(phone, describe.inPerson(result))
    notifyOwner(
      `🎬 Formation 1 jour — inscription n°${result.id}\nNom : ${fullName}\nTél : ${phone}\nSamedi : ${day} (${cfg.startTime}–${cfg.endTime})\nAcompte : ${cfg.deposit} DA en attente` +
      (message ? `\nMessage : ${message}` : '')
    )
    res.status(201).json({ registration: { id: result.id, day } })
  } catch (err) {
    if (err instanceof SessionError) return res.status(err.status).json({ error: err.message })
    next(err)
  }
})

// ─── Inscription sur place par QR code ──────────────────────
// Seul quelqu'un qui a scanné le QR (code secret gardé par l'admin) peut créer un compte ici.
const validJoinCode = (code) => {
  const expected = getSettings().inPerson.joinCode || ''
  const given = String(code || '')
  return expected.length >= 8 && given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
}

router.get('/join/check', (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.json({ valid: validJoinCode(req.query.code) })
})

const joinSchema = z.object({
  code: z.string().max(100),
  fullName: z.string().trim().min(3).max(80),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,20}$/),
})

router.post('/join', async (req, res, next) => {
  try {
    const parsed = joinSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Vérifiez votre nom et votre numéro de téléphone.' })
    const { code, fullName, phone } = parsed.data
    if (!validJoinCode(code)) return res.status(403).json({ error: 'Ce QR code n\'est plus valide. Demandez le nouveau au formateur.' })

    const account = await createPhoneAccount({ fullName, phone })
    await prisma.inPersonRegistration.create({
      data: { fullName, phone, message: 'Compte créé sur place (QR code)', ip: String(req.ip || '').slice(0, 45) },
    })
    notifyOwner(`📲 Nouveau compte via QR — ${fullName} (${phone})`)
    res.status(201).json({ account })
  } catch (err) {
    if (err instanceof AccountExistsError) return res.status(409).json({ error: err.message })
    next(err)
  }
})

module.exports = router
