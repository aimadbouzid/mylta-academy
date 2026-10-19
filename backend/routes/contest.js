const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma')
const { getSettings } = require('../settingsManager')
const { notifyOwner } = require('../utils/notifyOwner')

const router = express.Router()

// Les 113 premiers tickets ont été distribués avant l'inscription en ligne :
// le premier participant du site reçoit le n° 114.
const TICKETS_BEFORE = 113
const ticketCount = async () => TICKETS_BEFORE + await prisma.contestEntry.count()

// GET /api/contest/next — numéro du prochain ticket
router.get('/next', async (req, res, next) => {
  try { res.json({ next: await ticketCount() + 1 }) } catch (err) { next(err) }
})

const entrySchema = z.object({
  fullName: z.string().trim().min(3).max(80),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,20}$/),
  city: z.string().trim().max(60).optional().default(''),
  prize: z.string().trim().max(60).optional().default(''),
  website: z.string().optional(), // piège à robots
})

// POST /api/contest/enter — une participation par numéro de téléphone
router.post('/enter', async (req, res, next) => {
  try {
    const contest = getSettings().contest
    const today = new Date().toISOString().slice(0, 10)
    if (!contest?.enabled || (contest.endDate && contest.endDate < today)) {
      return res.status(404).json({ error: 'Le concours est terminé.' })
    }
    const parsed = entrySchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Vérifiez votre nom et votre numéro de téléphone.' })
    const { fullName, phone, city, prize, website } = parsed.data
    if (website) return res.status(201).json({ ok: true })

    const digits = phone.replace(/\D/g, '')
    const exists = await prisma.contestEntry.findUnique({ where: { phone: digits } })
    if (exists) return res.status(409).json({ error: 'Ce numéro participe déjà. Bonne chance !' })

    const entry = await prisma.contestEntry.create({
      data: {
        fullName, city, phone: digits,
        prize: (contest.prizes || []).includes(prize) ? prize : '',
        ip: String(req.ip || '').slice(0, 45),
      },
    })
    const ticket = TICKETS_BEFORE + await prisma.contestEntry.count({ where: { id: { lte: entry.id } } })
    notifyOwner(`🎁 Concours — ticket n°${ticket} : ${fullName} (${phone})${prize ? ` · ${prize}` : ''}`)
    res.status(201).json({ ok: true, ticket })
  } catch (err) { next(err) }
})

module.exports = router
