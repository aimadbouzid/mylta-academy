const prisma = require('../prisma')

/**
 * Enregistre un événement de sécurité (Audit Trail)
 * @param {Object} params
 * @param {Number} params.userId - L'ID de l'utilisateur (si connu)
 * @param {String} params.action - L'action tentée (ex: "IDOR_ATTEMPT", "UNAUTHORIZED_ADMIN_ACCESS", "INVALID_VIDEO_TOKEN")
 * @param {String} params.details - Détails supplémentaires
 * @param {String} params.ip - Adresse IP de la requête
 */
async function logSecurityEvent({ userId = null, action, details = null, ip = null }) {
  try {
    await prisma.securityLog.create({
      data: {
        userId,
        action,
        details,
        ip
      }
    })
    console.warn(`🚨 [SECURITY] ${action} (User: ${userId || 'GUEST'}, IP: ${ip || 'Unknown'}) - ${details || ''}`)
  } catch (error) {
    console.error('❌ [SECURITY LOGGER ERROR]', error)
  }
}

module.exports = {
  logSecurityEvent
}
