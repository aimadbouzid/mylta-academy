// ============================================================
// MIDDLEWARE isInstructor — Mylta Academy (Marketplace)
// Vérifie que l'utilisateur est un formateur approuvé
// ============================================================

const { t } = require('../i18n')

/**
 * isInstructor — S'assure que l'utilisateur authentifié est un formateur approuvé.
 * Doit être utilisé APRÈS authenticate dans la chaîne de middlewares.
 */
const isInstructor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: t('auth.unauthenticated', req.lang),
      code: 'UNAUTHENTICATED',
    })
  }

  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({
      error: 'Accès réservé aux formateurs.',
      code: 'FORBIDDEN_INSTRUCTOR_ONLY',
    })
  }

  next()
}

/**
 * isInstructorApproved — Vérifie que le formateur est approuvé par l'admin.
 * À utiliser pour les routes de création de contenu.
 */
const isInstructorApproved = async (req, res, next) => {
  const prisma = require('../prisma')

  if (!req.user) {
    return res.status(401).json({
      error: t('auth.unauthenticated', req.lang),
      code: 'UNAUTHENTICATED',
    })
  }

  if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Accès réservé aux formateurs.',
      code: 'FORBIDDEN_INSTRUCTOR_ONLY',
    })
  }

  // Admin always has access
  if (req.user.role === 'ADMIN') return next()

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { instructorApproved: true },
  })

  if (!user || !user.instructorApproved) {
    return res.status(403).json({
      error: 'Votre compte formateur n\'est pas encore approuvé.',
      code: 'INSTRUCTOR_NOT_APPROVED',
    })
  }

  next()
}

module.exports = { isInstructor, isInstructorApproved }
