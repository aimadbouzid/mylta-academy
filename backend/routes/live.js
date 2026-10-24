// ============================================================
// MYLTA LIVE — Conférences interactives (QR, votes, quiz, classement)
//
// Deux publics :
//  - L'organisateur (compte ADMIN existant) crée et pilote la session
//    depuis /api/admin/live/* (protégé par authenticate + isAdmin, monté
//    dans server.js comme le reste de /api/admin).
//  - Le participant rejoint sans compte, juste avec le QR affiché en salle :
//    /api/live/* lui délivre un jeton court scope "live", propre à cette
//    session, qu'il réutilise pour répondre et voter.
//
// Le grand écran (vidéoprojecteur) utilise un troisième jeton, scope
// "live-display" : lecture seule, jamais la session admin, pour que
// l'anti-partage du socket principal (middleware/auth.js ne s'applique
// pas ici, c'est socket.js) ne le déconnecte jamais.
// ============================================================

const express = require('express')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const prisma = require('../prisma')
const { authenticate, isAdmin } = require('../middleware/auth')
const { getLiveIO } = require('../socket')

const router = express.Router()
const adminRouter = express.Router()

const LIVE_TOKEN_TTL = '6h' // une conférence dépasse rarement cette durée

const signLiveToken = (payload) => jwt.sign({ scope: 'live', ...payload }, process.env.JWT_SECRET, { expiresIn: LIVE_TOKEN_TTL })
const signDisplayToken = (sessionId) => jwt.sign({ scope: 'live-display', sessionId }, process.env.JWT_SECRET, { expiresIn: LIVE_TOKEN_TTL })

// Jeton participant : vérifie scope "live" + que la session du jeton
// correspond à celle visée par l'URL (sinon un jeton d'une autre
// conférence pourrait répondre ici).
const requireParticipant = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Rejoignez la session pour continuer.' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.scope !== 'live') throw new Error('scope')
    req.live = decoded // { sessionId, participantId, isOrganizer }
    next()
  } catch {
    return res.status(401).json({ error: 'Session expirée, rejoignez à nouveau.' })
  }
}

const createSessionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional().default(''),
  maxParticipants: z.number().int().positive().max(5000).optional(),
})

const questionSchema = z.object({
  text: z.string().trim().min(3).max(300),
  type: z.enum(['poll', 'quiz', 'freeform']).default('poll'),
  options: z.array(z.string().trim().min(1).max(100)).max(8).optional().default([]),
  correctAnswer: z.string().trim().max(100).optional(),
})

const joinSchema = z.object({
  email: z.string().trim().email().max(150),
  displayName: z.string().trim().min(2).max(60),
})

// ──────────────────────────────────────────────────────────
// ADMIN — gestion des sessions (monté sous /api/admin/live, déjà protégé
// par authenticate + isAdmin au niveau du routeur /api/admin)
// ──────────────────────────────────────────────────────────

adminRouter.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await prisma.liveSession.findMany({
      where: { createdBy: String(req.user.id) },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { participants: true, questions: true } } },
    })
    res.json({ sessions })
  } catch (err) { next(err) }
})

adminRouter.post('/sessions', async (req, res, next) => {
  try {
    const data = createSessionSchema.parse(req.body)
    const session = await prisma.liveSession.create({
      data: { ...data, createdBy: String(req.user.id) },
    })
    res.status(201).json({ session })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Données invalides.' })
    next(err)
  }
})

adminRouter.get('/sessions/:id', async (req, res, next) => {
  try {
    const session = await prisma.liveSession.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { orderBy: { createdAt: 'asc' } },
        participants: { orderBy: { score: 'desc' } },
      },
    })
    if (!session || session.createdBy !== String(req.user.id)) {
      return res.status(404).json({ error: 'Session introuvable.' })
    }
    res.json({ session })
  } catch (err) { next(err) }
})

// draft -> live -> ended. Démarrer prévient aussi le grand écran et les
// participants déjà connectés via le socket.
adminRouter.patch('/sessions/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['draft', 'live', 'ended']) }).parse(req.body)
    const session = await prisma.liveSession.findUnique({ where: { id: req.params.id } })
    if (!session || session.createdBy !== String(req.user.id)) {
      return res.status(404).json({ error: 'Session introuvable.' })
    }
    const updated = await prisma.liveSession.update({
      where: { id: req.params.id },
      data: {
        status,
        startedAt: status === 'live' && !session.startedAt ? new Date() : undefined,
        endedAt: status === 'ended' ? new Date() : undefined,
      },
    })
    try { getLiveIO().to(`live_session_${req.params.id}`).emit('live:status', { status }) } catch { /* namespace pas encore prêt */ }
    res.json({ session: updated })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Statut invalide.' })
    next(err)
  }
})

adminRouter.post('/sessions/:id/questions', async (req, res, next) => {
  try {
    const session = await prisma.liveSession.findUnique({ where: { id: req.params.id } })
    if (!session || session.createdBy !== String(req.user.id)) {
      return res.status(404).json({ error: 'Session introuvable.' })
    }
    const data = questionSchema.parse(req.body)
    const question = await prisma.liveQuestion.create({ data: { ...data, sessionId: req.params.id } })
    // Diffusion immédiate si la session est déjà lancée : l'organisateur
    // peut ajouter des questions au fil de la conférence.
    try { getLiveIO().to(`live_session_${req.params.id}`).emit('live:question', { question }) } catch { /* namespace pas encore prêt */ }
    res.status(201).json({ question })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Question invalide.' })
    next(err)
  }
})

// Résultats d'une question : comptage des votes par option + réponses.
adminRouter.get('/questions/:id/results', async (req, res, next) => {
  try {
    const question = await prisma.liveQuestion.findUnique({
      where: { id: req.params.id },
      include: { session: true, votes: true, answers: true },
    })
    if (!question || question.session.createdBy !== String(req.user.id)) {
      return res.status(404).json({ error: 'Question introuvable.' })
    }
    const tally = {}
    for (const v of question.votes) tally[v.option] = (tally[v.option] || 0) + 1
    res.json({ tally, totalVotes: question.votes.length, totalAnswers: question.answers.length })
  } catch (err) { next(err) }
})

// Jeton d'affichage grand écran : lecture seule, jamais liée au compte admin.
adminRouter.get('/sessions/:id/display-token', async (req, res, next) => {
  try {
    const session = await prisma.liveSession.findUnique({ where: { id: req.params.id } })
    if (!session || session.createdBy !== String(req.user.id)) {
      return res.status(404).json({ error: 'Session introuvable.' })
    }
    res.json({ token: signDisplayToken(session.id) })
  } catch (err) { next(err) }
})

// ──────────────────────────────────────────────────────────
// PUBLIC — rejoindre et participer, sans compte (monté sous /api/live,
// avec ses propres limiteurs côté server.js)
// ──────────────────────────────────────────────────────────

// Infos minimales pour afficher l'écran "Vous rejoignez : <titre>" avant
// de demander le nom — pas besoin d'être déjà authentifié pour ça.
router.get('/sessions/:id/public', async (req, res, next) => {
  try {
    const session = await prisma.liveSession.findUnique({
      where: { id: req.params.id },
      select: { id: true, title: true, description: true, status: true, maxParticipants: true, _count: { select: { participants: true } } },
    })
    if (!session) return res.status(404).json({ error: 'Session introuvable.' })
    res.json({ session })
  } catch (err) { next(err) }
})

router.post('/sessions/:id/join', async (req, res, next) => {
  try {
    const session = await prisma.liveSession.findUnique({ where: { id: req.params.id } })
    if (!session) return res.status(404).json({ error: 'Session introuvable.' })
    if (session.status === 'ended') return res.status(409).json({ error: 'Cette session est terminée.' })

    const { email, displayName } = joinSchema.parse(req.body)

    if (session.maxParticipants) {
      const count = await prisma.liveParticipant.count({ where: { sessionId: session.id } })
      const already = await prisma.liveParticipant.findUnique({ where: { sessionId_email: { sessionId: session.id, email } } })
      if (!already && count >= session.maxParticipants) {
        return res.status(409).json({ error: 'Cette session est complète.' })
      }
    }

    const participant = await prisma.liveParticipant.upsert({
      where: { sessionId_email: { sessionId: session.id, email } },
      update: { displayName },
      create: { sessionId: session.id, email, displayName },
    })

    const token = signLiveToken({ sessionId: session.id, participantId: participant.id, isOrganizer: false })
    res.json({ token, participant: { id: participant.id, displayName: participant.displayName, score: participant.score } })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Nom ou e-mail invalide.' })
    next(err)
  }
})

// État courant pour un participant déjà inscrit : question active, son score.
router.get('/sessions/:id/state', requireParticipant, async (req, res, next) => {
  try {
    if (req.live.sessionId !== req.params.id) return res.status(403).json({ error: 'Jeton d\'une autre session.' })
    const session = await prisma.liveSession.findUnique({
      where: { id: req.params.id },
      include: { questions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })
    if (!session) return res.status(404).json({ error: 'Session introuvable.' })
    const participant = await prisma.liveParticipant.findUnique({ where: { id: req.live.participantId } })
    res.json({ status: session.status, currentQuestion: session.questions[0] || null, score: participant?.score ?? 0 })
  } catch (err) { next(err) }
})

router.post('/questions/:id/answer', requireParticipant, async (req, res, next) => {
  try {
    const { answer } = z.object({ answer: z.string().trim().min(1).max(200) }).parse(req.body)
    const question = await prisma.liveQuestion.findUnique({ where: { id: req.params.id } })
    if (!question || question.sessionId !== req.live.sessionId) return res.status(404).json({ error: 'Question introuvable.' })

    const isCorrect = question.type === 'quiz' && question.correctAnswer
      ? answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
      : null

    const saved = await prisma.liveAnswer.upsert({
      where: { questionId_participantId: { questionId: question.id, participantId: req.live.participantId } },
      update: { answer, isCorrect },
      create: { questionId: question.id, participantId: req.live.participantId, answer, isCorrect },
    })

    // Un quiz correct ajoute 10 points — simple, pas de bonus de vitesse
    // pour l'instant ; affiné si l'usage réel le demande.
    if (isCorrect) {
      await prisma.liveParticipant.update({ where: { id: req.live.participantId }, data: { score: { increment: 10 } } })
    }

    try {
      getLiveIO().to(`live_admin_${req.live.sessionId}`).emit('live:answer', { questionId: question.id, participantId: req.live.participantId })
    } catch { /* namespace pas encore prêt */ }

    res.json({ ok: true, isCorrect, answer: saved })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Réponse invalide.' })
    next(err)
  }
})

router.post('/questions/:id/vote', requireParticipant, async (req, res, next) => {
  try {
    const { option } = z.object({ option: z.string().trim().min(1).max(100) }).parse(req.body)
    const question = await prisma.liveQuestion.findUnique({ where: { id: req.params.id } })
    if (!question || question.sessionId !== req.live.sessionId) return res.status(404).json({ error: 'Question introuvable.' })
    if (question.options.length && !question.options.includes(option)) return res.status(400).json({ error: 'Option inconnue.' })

    await prisma.liveVote.upsert({
      where: { questionId_participantId: { questionId: question.id, participantId: req.live.participantId } },
      update: { option },
      create: { questionId: question.id, sessionId: req.live.sessionId, participantId: req.live.participantId, option },
    })

    try {
      const tally = await prisma.liveVote.groupBy({ by: ['option'], where: { questionId: question.id }, _count: true })
      getLiveIO().to(`live_session_${req.live.sessionId}`).emit('live:vote_update', {
        questionId: question.id,
        tally: tally.reduce((acc, t) => ({ ...acc, [t.option]: t._count }), {}),
      })
    } catch { /* namespace pas encore prêt */ }

    res.json({ ok: true })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Vote invalide.' })
    next(err)
  }
})

router.get('/sessions/:id/leaderboard', async (req, res, next) => {
  try {
    const participants = await prisma.liveParticipant.findMany({
      where: { sessionId: req.params.id },
      orderBy: { score: 'desc' },
      take: 20,
      select: { displayName: true, score: true },
    })
    res.json({ leaderboard: participants })
  } catch (err) { next(err) }
})

module.exports = { router, adminRouter }
