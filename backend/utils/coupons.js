// ============================================================
// Résolution des coupons de réduction
// Un coupon peut être global (courseId null, créé par l'admin) ou
// restreint à une formation (créé par le formateur propriétaire).
// Utilisé par la prévisualisation ET par les deux flux d'achat,
// pour qu'un coupon ne puisse pas être appliqué hors de sa portée.
// ============================================================

const prisma = require('../prisma')

// Retourne { coupon } si utilisable, sinon { error, status }.
async function resolveCoupon(code, courseId) {
  if (!code) return { coupon: null }

  const coupon = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase() } })

  if (!coupon || !coupon.isActive) {
    return { error: 'Code promo invalide ou inactif', status: 404 }
  }
  // Coupon d'un formateur : valable uniquement sur sa formation
  if (coupon.courseId && coupon.courseId !== courseId) {
    return { error: 'Ce code promo ne s\'applique pas à cette formation', status: 400 }
  }
  if (coupon.currentUses >= coupon.maxUses) {
    return { error: 'Ce code promo a atteint sa limite d\'utilisation', status: 400 }
  }
  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
    return { error: 'Ce code promo a expiré', status: 400 }
  }

  return { coupon }
}

module.exports = { resolveCoupon }
