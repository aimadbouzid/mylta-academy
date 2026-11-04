// ============================================================
// META — API CONVERSIONS (suivi côté serveur)
// ============================================================
//
// Le pixel du navigateur ne part pas toujours : bloqueur de publicité, refus
// des cookies, onglet fermé trop tôt. Le serveur, lui, envoie l'évènement à
// coup sûr, au moment où l'inscription est réellement enregistrée.
//
// Les deux envois portent le même `eventId` : Meta les rapproche et n'en
// compte qu'un seul. Sans cet identifiant, chaque inscription serait comptée
// deux fois et les coûts par conversion seraient faux.
//
// Sans FACEBOOK_PIXEL_ID ou FACEBOOK_CAPI_TOKEN, le module reste inerte :
// rien n'est envoyé, et surtout rien ne casse l'inscription.

const crypto = require('crypto')

const PIXEL = process.env.FACEBOOK_PIXEL_ID
const TOKEN = process.env.FACEBOOK_CAPI_TOKEN
const VERSION = 'v21.0'

const estConfigure = () => Boolean(PIXEL && TOKEN)

// Meta n'accepte les données personnelles que hachées (SHA-256), en minuscules
// et sans espaces autour.
const hacher = (valeur) => {
  if (!valeur) return undefined
  return crypto.createHash('sha256').update(String(valeur).trim().toLowerCase()).digest('hex')
}

// Un numéro algérien se donne « 0555 12 34 56 » ; Meta le veut en format
// international, chiffres seuls : 213555123456.
const normaliserTelephone = (tel) => {
  if (!tel) return undefined
  let chiffres = String(tel).replace(/\D/g, '')
  if (chiffres.startsWith('00')) chiffres = chiffres.slice(2)
  if (chiffres.startsWith('0')) chiffres = '213' + chiffres.slice(1)
  else if (!chiffres.startsWith('213')) chiffres = '213' + chiffres
  return chiffres
}

// « Amine Belkacem » → prénom et nom, hachés séparément.
const couperNom = (complet) => {
  const morceaux = String(complet || '').trim().split(/\s+/)
  if (!morceaux[0]) return {}
  return { fn: hacher(morceaux[0]), ln: morceaux.length > 1 ? hacher(morceaux.slice(1).join(' ')) : undefined }
}

/**
 * Envoie un évènement à Meta. Ne lève jamais : un échec de suivi ne doit pas
 * faire échouer une inscription.
 */
async function envoyerEvenement({
  nom, eventId, valeur, devise = 'DZD', telephone, nomComplet,
  ip, userAgent, sourceUrl, fbp, fbc, donneesSupplementaires = {},
}) {
  if (!estConfigure()) return { envoye: false, raison: 'non configuré' }

  const utilisateur = {
    ...couperNom(nomComplet),
    ph: hacher(normaliserTelephone(telephone)),
    client_ip_address: ip || undefined,
    client_user_agent: userAgent || undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
  }
  for (const cle of Object.keys(utilisateur)) {
    if (utilisateur[cle] === undefined) delete utilisateur[cle]
  }

  const evenement = {
    event_name: nom,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId || undefined,
    action_source: 'website',
    event_source_url: sourceUrl || undefined,
    user_data: utilisateur,
    custom_data: { currency: devise, value: Number(valeur) || 0, ...donneesSupplementaires },
  }

  try {
    const reponse = await fetch(`https://graph.facebook.com/${VERSION}/${PIXEL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [evenement], access_token: TOKEN }),
      signal: AbortSignal.timeout(5000),
    })
    const corps = await reponse.json().catch(() => ({}))
    if (!reponse.ok) {
      console.warn('[Meta] évènement refusé :', corps?.error?.message || reponse.status)
      return { envoye: false, raison: corps?.error?.message || String(reponse.status) }
    }
    return { envoye: true, recus: corps?.events_received }
  } catch (err) {
    // Meta injoignable : on note et on passe. L'inscription est déjà en base.
    console.warn('[Meta] envoi impossible :', err.message)
    return { envoye: false, raison: err.message }
  }
}

module.exports = { envoyerEvenement, estConfigure }
