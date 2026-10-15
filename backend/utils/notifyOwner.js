// Notification WhatsApp au propriétaire via CallMeBot (https://www.callmebot.com).
// Configuration dans backend/.env (jamais dans settings.json, qui est public) :
//   CALLMEBOT_PHONE=+213XXXXXXXXX
//   CALLMEBOT_APIKEY=xxxxxx
// Sans ces variables, aucun envoi : l'inscription reste visible dans l'admin.
const axios = require('axios')

async function notifyOwner(text) {
  const phone = process.env.CALLMEBOT_PHONE
  const apikey = process.env.CALLMEBOT_APIKEY
  if (!phone || !apikey) return

  try {
    await axios.get('https://api.callmebot.com/whatsapp.php', {
      params: { phone, apikey, text: text.slice(0, 1500) },
      timeout: 10000,
    })
  } catch (err) {
    console.error('[WHATSAPP] Notification non envoyée :', err.message)
  }
}

module.exports = { notifyOwner }
