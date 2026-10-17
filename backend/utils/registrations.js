// Inscriptions (coaching en ligne, présentiel 3 jours, formation d'un jour) liées
// à un compte par le numéro de téléphone : les formulaires ne demandent pas de compte.
const prisma = require('../prisma')
const { phoneDigits } = require('./phoneAccount')

const PHONE_DOMAIN = '@tel.myltaacademy.com'

// Même numéro écrit autrement (0555…, +213 555…, 213555…) → 9 derniers chiffres.
const phoneKey = (phone) => phoneDigits(phone).slice(-9)

const describe = {
  coaching: (b) => ({
    id: `c${b.id}`,
    kind: 'coaching',
    title: `Coaching en ligne — ${b.topicLabel}`,
    date: b.date,
    time: b.timeSlot,
    detail: b.formatLabel,
    status: b.status,
    createdAt: b.createdAt,
  }),
  inPerson: (r) => r.formation === 'express'
    ? { id: `p${r.id}`, kind: 'express', title: "Formation d'un jour (samedi)", date: r.day, time: '', detail: '', status: r.status, createdAt: r.createdAt }
    : {
        id: `p${r.id}`,
        kind: r.session ? 'inPerson' : 'waitlist',
        title: r.session ? 'Formation présentielle 3 jours' : "Liste d'attente — formation présentielle",
        date: r.session?.date || '',
        time: r.session ? [r.session.startTime, r.session.endTime].filter(Boolean).join('–') : '',
        detail: r.session ? [r.session.city, r.session.place].filter(Boolean).join(' — ') : '',
        status: r.status,
        createdAt: r.createdAt,
      },
}

async function registrationsForPhone(phone) {
  const key = phoneKey(phone)
  if (key.length < 9) return []
  const [inPerson, coaching] = await Promise.all([
    prisma.inPersonRegistration.findMany({ where: { status: { not: 'CANCELLED' } }, include: { session: true } }),
    prisma.coachingBooking.findMany({ where: { status: { not: 'CANCELLED' } } }),
  ])
  return [
    ...coaching.filter(b => phoneKey(b.phone) === key).map(describe.coaching),
    // Les comptes créés via le QR code ne sont pas des inscriptions.
    ...inPerson.filter(r => phoneKey(r.phone) === key && r.message !== 'Compte créé sur place (QR code)').map(describe.inPerson),
  ].sort((a, b) => b.createdAt - a.createdAt)
}

// Compte « téléphone » correspondant au numéro, quel que soit son format.
async function userForPhone(phone) {
  const key = phoneKey(phone)
  if (key.length < 9) return null
  return prisma.user.findFirst({
    where: { email: { in: [key, `0${key}`, `213${key}`, `00213${key}`].map(d => d + PHONE_DOMAIN) } },
    select: { id: true },
  })
}

const notificationFor = (reg) => ({
  title: 'Inscription confirmée ✅',
  message: `Votre inscription est bien enregistrée : ${reg.title}` +
    (reg.date ? ` — ${reg.date}${reg.time ? ` (${reg.time})` : ''}` : '') +
    '. Retrouvez-la dans « Mes formations ».',
  type: 'SUCCESS',
})

// Après une inscription : prévient le compte lié au numéro, s'il existe.
async function notifyRegistration(phone, reg) {
  try {
    const user = await userForPhone(phone)
    if (user) await prisma.notification.create({ data: { userId: user.id, ...notificationFor(reg) } })
  } catch (err) {
    console.error('notifyRegistration:', err.message)
  }
}

// À la création du compte : une notification par inscription déjà faite avec ce numéro.
async function notifyExistingRegistrations(userId, phone) {
  try {
    const regs = await registrationsForPhone(phone)
    if (regs.length) await prisma.notification.createMany({ data: regs.map(r => ({ userId, ...notificationFor(r) })) })
  } catch (err) {
    console.error('notifyExistingRegistrations:', err.message)
  }
}

const phoneOfUser = (user) => user?.email?.endsWith(PHONE_DOMAIN) ? user.email.slice(0, -PHONE_DOMAIN.length) : null

module.exports = { registrationsForPhone, notifyRegistration, notifyExistingRegistrations, phoneOfUser, describe }
