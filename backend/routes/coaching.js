const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma')
const { getSettings } = require('../settingsManager')
const { notifyOwner } = require('../utils/notifyOwner')
const { notifyRegistration, describe } = require('../utils/registrations')

const router = express.Router()

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const ymd = (d) => d.toISOString().slice(0, 10)

// Dates comparées en UTC à midi : une chaîne "YYYY-MM-DD" n'a pas de fuseau,
// midi évite qu'un décalage horaire ne la fasse basculer sur un autre jour.
const toUtcNoon = (s) => new Date(`${s}T12:00:00Z`)

function dateError(date, cfg) {
  if (!DATE_RE.test(date) || Number.isNaN(toUtcNoon(date).getTime())) return 'Date invalide.'
  const today = ymd(new Date())
  const last = DATE_RE.test(cfg.bookUntil || '') ? cfg.bookUntil : ymd(new Date(Date.now() + 365 * 86400000))
  if (date < today || date > last) return 'Cette date n\'est pas disponible.'
  if (!(cfg.weekdays || []).includes(toUtcNoon(date).getUTCDay())) return 'Ce jour n\'est pas disponible.'
  if ((cfg.blockedDates || []).includes(date)) return 'Cette date n\'est pas disponible.'
  return null
}

// Créneaux en ligne qui tombent pendant une formation présentielle (3 jours consécutifs
// à partir de la date de session) : le coach ne peut pas être aux deux endroits.
const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0) }
const durationMin = (cfg) => {
  const m = String(cfg.formats?.[0]?.duration || '').match(/(\d+)\s*h\s*(\d+)?/i)
  return m ? Number(m[1]) * 60 + Number(m[2] || 0) : 150
}
async function inPersonBusy(cfg) {
  const today = ymd(new Date())
  const sessions = await prisma.inPersonSession.findMany({
    where: { isOpen: true, date: { gte: ymd(new Date(Date.now() - 3 * 86400000)) } },
    select: { date: true, startTime: true, endTime: true },
  })
  const len = durationMin(cfg)
  const busy = []
  for (const s of sessions) {
    if (!s.startTime || !s.endTime) continue
    const start = toMin(s.startTime) - 30 // marge pour se déplacer
    const end = toMin(s.endTime) + 30
    for (let i = 0; i < 3; i++) {
      const day = ymd(new Date(toUtcNoon(s.date).getTime() + i * 86400000))
      if (day < today) continue
      for (const slot of cfg.timeSlots || []) {
        const a = toMin(slot)
        if (a < end && a + len > start) busy.push({ date: day, timeSlot: slot, reason: 'presentiel' })
      }
    }
  }
  return busy
}

// GET /api/coaching/availability — créneaux déjà pris (pour griser le calendrier)
router.get('/availability', async (req, res, next) => {
  try {
    const cfg = getSettings().coaching
    if (!cfg.enabled) return res.status(404).json({ error: 'Coaching indisponible.' })

    const bookings = await prisma.coachingBooking.findMany({
      where: { status: { not: 'CANCELLED' }, date: { gte: ymd(new Date()) } },
      select: { date: true, timeSlot: true },
    })
    const busy = await inPersonBusy(cfg)
    res.setHeader('Cache-Control', 'no-store')
    res.json({ booked: [...bookings, ...busy] })
  } catch (err) { next(err) }
})

const bookingSchema = z.object({
  fullName: z.string().trim().min(3).max(80),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,20}$/),
  topicId: z.string().trim().min(1).max(50),
  date: z.string().trim(),
  timeSlot: z.string().trim().max(10).optional().default(''),
  formatId: z.string().trim().max(50).optional().default(''),
  channel: z.string().trim().max(50).optional().default(''),
  level: z.string().trim().max(30).optional().default(''),
  participants: z.coerce.number().int().min(1).max(20).optional().default(1),
  companions: z.array(z.object({
    fullName: z.string().trim().min(3).max(80),
    phone: z.string().trim().regex(/^\+?[0-9 ]{8,20}$/),
  })).max(19).optional().default([]),
  message: z.string().trim().max(500).optional(),
  website: z.string().optional(), // piège à robots : toujours vide pour un humain
})

const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé']

// POST /api/coaching/book — réservation publique (sans compte)
router.post('/book', async (req, res, next) => {
  try {
    const cfg = getSettings().coaching
    if (!cfg.enabled) return res.status(404).json({ error: 'Coaching indisponible.' })

    const parsed = bookingSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Vérifiez votre nom, votre numéro de téléphone et le sujet choisi.' })
    }
    const { fullName, phone, topicId, date, timeSlot, formatId, channel, level, message, website, participants, companions } = parsed.data
    // Robot : réponse normale pour ne pas lui signaler le piège, mais rien n'est enregistré.
    if (website) return res.status(201).json({ booking: { id: 0, date, timeSlot, topicLabel: '', formatLabel: '', channel: '', level: '', price: 0 } })

    const topic = (cfg.topics || []).find(t => t.id === topicId)
    if (!topic) return res.status(400).json({ error: 'Sujet invalide.' })

    const formats = cfg.formats || []
    const format = formats.find(f => f.id === formatId)
    if (formats.length > 0 && !format) return res.status(400).json({ error: 'Choisissez une formule.' })

    const channels = cfg.channels || []
    if (channels.length > 0 && !channels.includes(channel)) return res.status(400).json({ error: 'Choisissez comment se déroule la séance.' })
    if (level && !LEVELS.includes(level)) return res.status(400).json({ error: 'Niveau invalide.' })
    if (participants > (Number(cfg.maxParticipants) || 1)) {
      return res.status(400).json({ error: `Une séance accueille ${Number(cfg.maxParticipants) || 1} personne(s) au maximum.` })
    }
    if (companions.length < participants - 1) {
      return res.status(400).json({ error: 'Indiquez le nom et le numéro de chaque personne qui vous accompagne.' })
    }
    const friends = companions.slice(0, participants - 1)

    const err = dateError(date, cfg)
    if (err) return res.status(400).json({ error: err })

    const slots = cfg.timeSlots || []
    if (slots.length > 0 && !slots.includes(timeSlot)) {
      return res.status(400).json({ error: 'Choisissez un horaire.' })
    }
    const slot = slots.length > 0 ? timeSlot : ''

    if (slot && (await inPersonBusy(cfg)).some(b => b.date === date && b.timeSlot === slot)) {
      return res.status(409).json({ error: 'Ce créneau tombe pendant une formation présentielle. Choisissez un autre horaire.' })
    }
    const taken = await prisma.coachingBooking.findFirst({
      where: { date, timeSlot: slot, status: { not: 'CANCELLED' } },
      select: { id: true },
    })
    if (taken) return res.status(409).json({ error: 'Ce créneau vient d\'être réservé. Choisissez-en un autre.' })

    const normalizedPhone = phone.replace(/\D/g, '')
    const sameDay = await prisma.coachingBooking.findMany({
      where: { date, status: { not: 'CANCELLED' } },
      select: { phone: true },
    })
    if (sameDay.some(b => b.phone.replace(/\D/g, '') === normalizedPhone)) {
      return res.status(409).json({ error: 'Vous avez déjà une réservation ce jour-là. Écrivez-nous sur WhatsApp pour la modifier.' })
    }

    const booking = await prisma.coachingBooking.create({
      data: {
        fullName,
        phone,
        topicId: topic.id,
        topicLabel: topic.label,
        formatLabel: format ? `${format.label}${format.duration ? ` (${format.duration})` : ''}` : '',
        participants,
        companions: friends.length > 0 ? friends : undefined,
        channel: channels.length > 0 ? channel : '',
        level: level || '',
        price: Number(format?.price) || Number(topic.price) || 0,
        date,
        timeSlot: slot,
        message: message || null,
        ip: String(req.ip || '').slice(0, 45),
      },
    })

    notifyRegistration(phone, describe.coaching(booking))
    notifyOwner(
      `🎓 Nouvelle réservation coaching en ligne n°${booking.id}\n` +
      `Nom : ${fullName}\nTél : ${phone}\nSujet : ${topic.label}\n` +
      `Personnes : ${participants}\n` +
      friends.map((f, i) => `Ami ${i + 1} : ${f.fullName} — ${f.phone}\n`).join('') +
      `Date : ${date}${slot ? ` à ${slot}` : ''}` +
      (message ? `\nMessage : ${message}` : '')
    )

    res.status(201).json({ booking: {
      id: booking.id, date, timeSlot: slot, topicLabel: topic.label,
      formatLabel: booking.formatLabel, channel: booking.channel, level: booking.level, price: booking.price,
      participants: booking.participants, companions: friends,
    } })
  } catch (err) { next(err) }
})

module.exports = router
