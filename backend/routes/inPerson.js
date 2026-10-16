const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma')
const { getSettings } = require('../settingsManager')
const { notifyOwner } = require('../utils/notifyOwner')
const crypto = require('crypto')
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
    const { fullName, phone, city, message, sessionId, profile, accepted, website } = parsed.data
    if (website) return res.status(201).json({ registration: { id: 0, session: null } })
    if (sessionId && accepted !== true) {
      return res.status(400).json({ error: 'Merci d\'accepter les conditions de participation.' })
    }
    const profileText = Object.entries(PROFILE_LABELS)
      .filter(([key]) => profile[key])
      .map(([key, label]) => `${label} : ${profile[key]}`)
      .join(' · ')
    const data = { fullName, phone, city, profile: profileText, message: message || null, ip: String(req.ip || '').slice(0, 45) }

    // Une même personne (même numéro) ne s'inscrit qu'une fois par session / liste d'attente.
    const normalizedPhone = phone.replace(/\D/g, '')
    const existing = await prisma.inPersonRegistration.findMany({
      where: { sessionId: sessionId || null, status: { not: 'CANCELLED' } },
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
      (session ? `\nSession : ${session.date}${session.city ? ` — ${session.city}` : ''}\nAcompte : en attente` : '') +
      (profileText ? `\n${profileText}` : '') +
      (message ? `\nMessage : ${message}` : '')
    )

    if (!sessionId) {
      const registration = await prisma.inPersonRegistration.create({ data })
      notify(registration.id, null)
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
    res.status(201).json({ registration: result })
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
