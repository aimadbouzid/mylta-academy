const express = require('express')
const { z } = require('zod')
const prisma = require('../prisma')
const { getSettings } = require('../settingsManager')
const { notifyOwner } = require('../utils/notifyOwner')

const router = express.Router()

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

    await prisma.contestEntry.create({
      data: {
        fullName, city, phone: digits,
        prize: (contest.prizes || []).includes(prize) ? prize : '',
        ip: String(req.ip || '').slice(0, 45),
      },
    })
    notifyOwner(`🎁 Concours — nouveau participant : ${fullName} (${phone})${prize ? ` · ${prize}` : ''}`)
    res.status(201).json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
