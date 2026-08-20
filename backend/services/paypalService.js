// ============================================================
// SERVICE PAYPAL — Mylta Academy
// Intégration PayPal Checkout (Orders API v2)
// STATUT: Prêt techniquement, EN ATTENTE d'activation (compte
// business PayPal non encore ouvert). Tant que PAYPAL_CLIENT_ID /
// PAYPAL_CLIENT_SECRET sont absents, les routes /paypal/* répondent
// 503 — voir routes/payments.js.
// ============================================================

const axios = require('axios')

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID
// Sandbox par défaut tant que le compte business n'est pas actif.
// Basculer sur https://api-m.paypal.com une fois en production.
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

function isConfigured() {
  return !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET)
}

function ensureConfigured() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET is not configured in environment variables.')
  }
}

/**
 * Récupère un access token OAuth2 PayPal (client_credentials).
 */
async function getAccessToken() {
  ensureConfigured()
  const basicAuth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

  const response = await axios.post(
    `${PAYPAL_API_URL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15000,
    }
  )
  return response.data.access_token
}

/**
 * Crée une commande PayPal (Orders API v2).
 *
 * @param {Object} params
 * @param {number} params.amount - Montant dans la devise courante (ex: 19.99)
 * @param {string} params.currency - Code devise ISO (ex: 'USD', 'EUR')
 * @param {string} params.courseName
 * @param {string} params.orderId - Identifiant interne unique
 * @param {number} params.userId
 * @param {number} params.courseId
 * @param {string} params.successUrl
 * @param {string} params.failureUrl
 * @returns {Promise<{checkoutUrl: string, checkoutId: string}>}
 */
async function createOrder({ amount, currency = 'USD', courseName, orderId, userId, courseId, successUrl, failureUrl }) {
  const accessToken = await getAccessToken()

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: orderId,
      description: `Formation: ${courseName}`,
      custom_id: JSON.stringify({ orderId, userId, courseId }),
      amount: {
        currency_code: currency,
        value: amount.toFixed(2),
      },
    }],
    application_context: {
      brand_name: 'Mylta Academy',
      return_url: successUrl,
      cancel_url: failureUrl,
      user_action: 'PAY_NOW',
    },
  }

  console.log(JSON.stringify({
    event: 'PAYPAL_ORDER_REQUEST',
    orderId, userId, courseId, amount, currency,
    timestamp: new Date().toISOString(),
  }))

  try {
    const response = await axios.post(`${PAYPAL_API_URL}/v2/checkout/orders`, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })

    const checkoutId = response.data.id
    const approveLink = response.data.links?.find(l => l.rel === 'approve')?.href

    if (!checkoutId || !approveLink) {
      throw new Error('PayPal API response missing id or approve link.')
    }

    console.log(JSON.stringify({
      event: 'PAYPAL_ORDER_CREATED',
      checkoutId, orderId, timestamp: new Date().toISOString(),
    }))

    return { checkoutUrl: approveLink, checkoutId }
  } catch (error) {
    const errData = error.response?.data || error.message
    console.error(JSON.stringify({
      event: 'PAYPAL_ORDER_FAILED',
      orderId, userId, courseId,
      error: typeof errData === 'string' ? errData : JSON.stringify(errData),
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    }))
    throw new Error(`PayPal order creation failed: ${error.response?.status || 'NETWORK_ERROR'}`)
  }
}

/**
 * Capture une commande PayPal approuvée par l'utilisateur.
 * @param {string} paypalOrderId
 */
async function captureOrder(paypalOrderId) {
  const accessToken = await getAccessToken()

  const response = await axios.post(
    `${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  )
  return response.data
}

/**
 * Vérifie la signature d'un webhook PayPal via l'API officielle
 * verify-webhook-signature (méthode recommandée par PayPal, plus fiable
 * qu'une reconstruction manuelle du HMAC côté serveur).
 * https://developer.paypal.com/api/rest/webhooks/rest/#verify-webhook-signature
 *
 * @param {Object} headers - en-têtes HTTP de la requête webhook
 * @param {Object} body - corps JSON parsé du webhook
 * @returns {Promise<boolean>}
 */
async function verifyWebhookSignature(headers, body) {
  if (!PAYPAL_WEBHOOK_ID) {
    console.error(JSON.stringify({
      event: 'PAYPAL_WEBHOOK_ID_NOT_CONFIGURED',
      timestamp: new Date().toISOString(),
    }))
    return false
  }

  try {
    const accessToken = await getAccessToken()
    const verificationPayload = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: body,
    }

    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      verificationPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    )

    return response.data.verification_status === 'SUCCESS'
  } catch (error) {
    console.error(JSON.stringify({
      event: 'PAYPAL_WEBHOOK_SIGNATURE_ERROR',
      error: error.response?.data || error.message,
      timestamp: new Date().toISOString(),
    }))
    return false
  }
}

module.exports = {
  isConfigured,
  createOrder,
  captureOrder,
  verifyWebhookSignature,
}
