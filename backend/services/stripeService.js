// ============================================================
// SERVICE STRIPE — Mylta Academy
// Intégration Stripe Checkout (Cartes internationales)
// STATUT: Prêt techniquement, EN ATTENTE d'activation (compte Stripe
// non encore ouvert). Tant que STRIPE_SECRET_KEY est absent, toutes
// les routes /stripe/* répondent 503 — voir routes/payments.js.
// ============================================================

const axios = require('axios')
const crypto = require('crypto')

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_API_URL = process.env.STRIPE_API_URL || 'https://api.stripe.com/v1'

function isConfigured() {
  return !!STRIPE_SECRET_KEY
}

function ensureConfigured() {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured in environment variables.')
  }
}

/**
 * Crée une Stripe Checkout Session (paiement carte internationale).
 *
 * @param {Object} params
 * @param {number} params.amount - Montant dans la devise courante (unité principale, ex: 19.99)
 * @param {string} params.currency - Code devise ISO (ex: 'usd', 'eur')
 * @param {string} params.courseName - Nom de la formation (affiché sur la page Stripe)
 * @param {string} params.orderId - Identifiant unique de la commande
 * @param {number} params.userId
 * @param {number} params.courseId
 * @param {string} params.successUrl
 * @param {string} params.failureUrl
 * @returns {Promise<{checkoutUrl: string, checkoutId: string}>}
 */
async function createCheckoutSession({ amount, currency = 'usd', courseName, orderId, userId, courseId, successUrl, failureUrl }) {
  ensureConfigured()

  // Stripe attend le montant en plus petite unité (centimes)
  const unitAmount = Math.round(amount * 100)

  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`)
  params.append('cancel_url', failureUrl)
  params.append('line_items[0][price_data][currency]', currency)
  params.append('line_items[0][price_data][product_data][name]', courseName)
  params.append('line_items[0][price_data][unit_amount]', String(unitAmount))
  params.append('line_items[0][quantity]', '1')
  params.append('client_reference_id', orderId)
  params.append('metadata[orderId]', orderId)
  params.append('metadata[userId]', String(userId))
  params.append('metadata[courseId]', String(courseId))

  console.log(JSON.stringify({
    event: 'STRIPE_CHECKOUT_REQUEST',
    orderId, userId, courseId, amount, currency,
    timestamp: new Date().toISOString(),
  }))

  try {
    const response = await axios.post(`${STRIPE_API_URL}/checkout/sessions`, params, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15000,
    })

    const { id: checkoutId, url: checkoutUrl } = response.data
    if (!checkoutUrl || !checkoutId) {
      throw new Error('Stripe API response missing url or id.')
    }

    console.log(JSON.stringify({
      event: 'STRIPE_CHECKOUT_CREATED',
      checkoutId, orderId, timestamp: new Date().toISOString(),
    }))

    return { checkoutUrl, checkoutId }
  } catch (error) {
    const errData = error.response?.data || error.message
    console.error(JSON.stringify({
      event: 'STRIPE_CHECKOUT_FAILED',
      orderId, userId, courseId,
      error: typeof errData === 'string' ? errData : JSON.stringify(errData),
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    }))
    throw new Error(`Stripe checkout creation failed: ${error.response?.status || 'NETWORK_ERROR'}`)
  }
}

/**
 * Vérifie la signature d'un webhook Stripe (schéma officiel Stripe-Signature).
 * https://docs.stripe.com/webhooks#verify-manually
 *
 * @param {Buffer|string} rawBody
 * @param {string} sigHeader - contenu du header 'stripe-signature'
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, sigHeader) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error(JSON.stringify({
      event: 'STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED',
      timestamp: new Date().toISOString(),
    }))
    return false
  }
  if (!sigHeader || !rawBody) return false

  try {
    const parts = Object.fromEntries(
      sigHeader.split(',').map(kv => {
        const idx = kv.indexOf('=')
        return [kv.slice(0, idx), kv.slice(idx + 1)]
      })
    )
    const timestamp = parts.t
    const signature = parts.v1
    if (!timestamp || !signature) return false

    const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody
    const signedPayload = `${timestamp}.${bodyStr}`
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload, 'utf8')
      .digest('hex')

    const sigBuffer = Buffer.from(signature, 'utf8')
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    if (sigBuffer.length !== expectedBuffer.length) return false

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  } catch (error) {
    console.error(JSON.stringify({
      event: 'STRIPE_WEBHOOK_SIGNATURE_ERROR',
      error: error.message,
      timestamp: new Date().toISOString(),
    }))
    return false
  }
}

/**
 * Récupère une Checkout Session Stripe (utile pour re-vérifier un paiement).
 */
async function retrieveCheckoutSession(sessionId) {
  ensureConfigured()
  const response = await axios.get(`${STRIPE_API_URL}/checkout/sessions/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
    timeout: 15000,
  })
  return response.data
}

module.exports = {
  isConfigured,
  createCheckoutSession,
  verifyWebhookSignature,
  retrieveCheckoutSession,
}
