// ============================================================
// SERVICE CHARGILY PAY — Mylta Academy (Production-Ready)
// Interactions avec l'API Chargily Pay V2
// ============================================================

const axios = require('axios')
const crypto = require('crypto')

// ─── Configuration ────────────────────────────────────────────
const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY
const CHARGILY_API_URL = process.env.CHARGILY_API_URL || 'https://pay.chargily.net/test/api/v2'

/**
 * Vérifie que la clé API Chargily est configurée.
 * @throws {Error} si la clé est absente
 */
function ensureConfigured() {
  if (!CHARGILY_SECRET_KEY) {
    throw new Error('CHARGILY_SECRET_KEY is not configured in environment variables.')
  }
}

/**
 * Crée un checkout Chargily Pay V2.
 * 
 * @param {Object} params
 * @param {number} params.amount - Montant en DZD
 * @param {string} params.courseName - Nom de la formation (affiché sur la page de paiement)
 * @param {string} params.orderId - Identifiant unique de la commande
 * @param {number} params.userId - ID de l'utilisateur
 * @param {number} params.courseId - ID de la formation
 * @param {string} params.successUrl - URL de redirection en cas de succès
 * @param {string} params.failureUrl - URL de redirection en cas d'échec
 * @returns {Promise<{checkoutUrl: string, checkoutId: string}>}
 */
async function createCheckout({ amount, courseName, orderId, userId, courseId, successUrl, failureUrl }) {
  ensureConfigured()

  const payload = {
    amount,
    currency: 'dzd',
    description: `Formation: ${courseName}`,
    success_url: successUrl,
    failure_url: failureUrl,
    metadata: {
      orderId,
      userId: String(userId),
      courseId: String(courseId),
    },
  }

  console.log(JSON.stringify({
    event: 'CHARGILY_CHECKOUT_REQUEST',
    orderId,
    userId,
    courseId,
    amount,
    timestamp: new Date().toISOString(),
  }))

  try {
    const response = await axios.post(`${CHARGILY_API_URL}/checkouts`, payload, {
      headers: {
        'Authorization': `Bearer ${CHARGILY_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15s timeout
    })

    const { id: checkoutId, checkout_url: checkoutUrl } = response.data

    if (!checkoutUrl || !checkoutId) {
      throw new Error('Chargily API response missing checkout_url or id.')
    }

    console.log(JSON.stringify({
      event: 'CHARGILY_CHECKOUT_CREATED',
      checkoutId,
      orderId,
      checkoutUrl,
      timestamp: new Date().toISOString(),
    }))

    return { checkoutUrl, checkoutId }
  } catch (error) {
    const errData = error.response?.data || error.message

    console.error(JSON.stringify({
      event: 'CHARGILY_CHECKOUT_FAILED',
      orderId,
      userId,
      courseId,
      error: typeof errData === 'string' ? errData : JSON.stringify(errData),
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    }))

    throw new Error(`Chargily checkout creation failed: ${error.response?.status || 'NETWORK_ERROR'}`)
  }
}

/**
 * Vérifie la signature HMAC-SHA256 d'un webhook Chargily.
 * 
 * La signature est calculée avec HMAC-SHA256 en utilisant la clé secrète API
 * sur le body brut de la requête.
 * 
 * @param {Buffer|string} rawBody - Le body brut de la requête (Buffer ou string)
 * @param {string} signature - La signature envoyée dans le header 'signature'
 * @returns {boolean} true si la signature est valide
 */
function verifyWebhookSignature(rawBody, signature) {
  ensureConfigured()

  if (!signature || !rawBody) {
    console.warn(JSON.stringify({
      event: 'CHARGILY_WEBHOOK_SIGNATURE_MISSING',
      hasSignature: !!signature,
      hasBody: !!rawBody,
      timestamp: new Date().toISOString(),
    }))
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', CHARGILY_SECRET_KEY)
      .update(rawBody)
      .digest('hex')

    // Timing-safe comparison (OWASP: prevent timing attacks)
    const sigBuffer = Buffer.from(signature, 'utf8')
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')

    if (sigBuffer.length !== expectedBuffer.length) {
      console.warn(JSON.stringify({
        event: 'CHARGILY_WEBHOOK_SIGNATURE_LENGTH_MISMATCH',
        receivedLength: sigBuffer.length,
        expectedLength: expectedBuffer.length,
        timestamp: new Date().toISOString(),
      }))
      return false
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  } catch (error) {
    console.error(JSON.stringify({
      event: 'CHARGILY_WEBHOOK_SIGNATURE_ERROR',
      error: error.message,
      timestamp: new Date().toISOString(),
    }))
    return false
  }
}

module.exports = {
  createCheckout,
  verifyWebhookSignature,
}
