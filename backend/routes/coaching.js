const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma')
const { getSettings } = require('../settingsManager')
const { notifyOwner } = require('../utils/notifyOwner')

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

// GET /api/coaching/availability — créneaux déjà pris (pour griser le calendrier)
router.get('/availability', async (req, res, next) => {
  try {
    const cfg = getSettings().coaching
    if (!cfg.enabled) return res.status(404).json({ error: 'Coaching indisponible.' })

    const bookings = await prisma.coachingBooking.findMany({
      where: { status: { not: 'CANCELLED' }, date: { gte: ymd(new Date()) } },
      select: { date: true, timeSlot: true },
    })
    res.setHeader('Cache-Control', 'no-store')
    res.json({ booked: bookings })
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
    const { fullName, phone, topicId, date, timeSlot, formatId, channel, level, message, website } = parsed.data
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

    const err = dateError(date, cfg)
    if (err) return res.status(400).json({ error: err })

    const slots = cfg.timeSlots || []
    if (slots.length > 0 && !slots.includes(timeSlot)) {
      return res.status(400).json({ error: 'Choisissez un horaire.' })
    }
    const slot = slots.length > 0 ? timeSlot : ''

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
        channel: channels.length > 0 ? channel : '',
        level: level || '',
        price: Number(format?.price) || Number(topic.price) || 0,
        date,
        timeSlot: slot,
        message: message || null,
        ip: String(req.ip || '').slice(0, 45),
      },
    })

    notifyOwner(
      `🎓 Nouvelle réservation coaching en ligne n°${booking.id}\n` +
      `Nom : ${fullName}\nTél : ${phone}\nSujet : ${topic.label}\n` +
      `Date : ${date}${slot ? ` à ${slot}` : ''}` +
      (message ? `\nMessage : ${message}` : '')
    )

    res.status(201).json({ booking: {
      id: booking.id, date, timeSlot: slot, topicLabel: topic.label,
      formatLabel: booking.formatLabel, channel: booking.channel, level: booking.level, price: booking.price,
    } })
  } catch (err) { next(err) }
})

module.exports = router
