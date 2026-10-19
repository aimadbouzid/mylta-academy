const prisma = require('../prisma')

// Une seule règle d'accès aux formations, partagée par toutes les routes :
// l'accès vient de l'appartenance au club, que l'administration accorde. Les
// achats faits avant le passage au club restent valables, sinon un élève
// perdrait un cours qu'il a payé.
//
// Retourne la raison de l'accès ('CLUB', 'PURCHASE', 'ADMIN') ou null.
async function accessReasonFor(userId, courseId) {
  if (!userId) return null
  const [user, receipt] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, isClubMember: true } }),
    prisma.receipt.findFirst({ where: { userId, courseId, status: 'APPROVED' }, select: { id: true } }),
  ])
  // L'achat prime : un membre qui avait payé reste un acheteur, et un admin
  // qui a réellement acheté ne doit pas lire « accès administrateur ».
  if (receipt) return 'PURCHASE'
  if (user?.isClubMember) return 'CLUB'
  if (user?.role === 'ADMIN') return 'ADMIN'
  return null
}

async function hasCourseAccess(userId, courseId) {
  return (await accessReasonFor(userId, courseId)) !== null
}

// Pour la liste des formations : un seul aller-retour, puis un test par cours.
async function accessContext(userId) {
  if (!userId) return { isClubMember: false, isAdmin: false, purchased: new Set() }
  const [user, receipts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, isClubMember: true } }),
    prisma.receipt.findMany({ where: { userId, status: 'APPROVED' }, select: { courseId: true } }),
  ])
  return {
    isClubMember: !!user?.isClubMember,
    isAdmin: user?.role === 'ADMIN',
    purchased: new Set(receipts.map(r => r.courseId)),
  }
}

const contextGrants = (ctx, courseId) => ctx.isClubMember || ctx.isAdmin || ctx.purchased.has(courseId)

module.exports = { accessReasonFor, hasCourseAccess, accessContext, contextGrants }
