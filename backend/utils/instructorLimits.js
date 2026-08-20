// ============================================================
// Limites de formations par formateur
// La limite dépend de l'offre (instructorPlan) et se configure
// dans settings.json → marketplace.courseLimitByPlan (admin).
// ============================================================

const { getSettings } = require('../settingsManager')

// Retourne la limite de formations d'un formateur, ou null si illimitée.
function getCourseLimit(instructor) {
  const marketplace = getSettings().marketplace || {}
  const byPlan = marketplace.courseLimitByPlan || {}
  const plan = instructor?.instructorPlan

  const raw = plan && byPlan[plan] !== undefined ? byPlan[plan] : marketplace.defaultCourseLimit
  const limit = Number(raw)

  // 0, valeur négative ou non numérique = pas de plafond
  if (!Number.isFinite(limit) || limit <= 0) return null
  return limit
}

// Assemble l'état du quota pour l'affichage dashboard et le contrôle serveur.
function buildCourseQuota(instructor, used) {
  const limit = getCourseLimit(instructor)
  const unlimited = limit === null

  return {
    plan: instructor?.instructorPlan || null,
    used,
    limit,                                                    // null = illimité
    remaining: unlimited ? null : Math.max(0, limit - used),
    unlimited,
    reached: !unlimited && used >= limit,
  }
}

module.exports = { getCourseLimit, buildCourseQuota }
