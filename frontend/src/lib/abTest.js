// ============================================================
// A/B TEST — un seul lien, le site répartit
// ============================================================
//
// Toutes les publicités pointent vers la même adresse. À sa première visite,
// le visiteur est tiré au sort entre les versions, et un cookie garde ce
// choix : il reverra la même page six mois durant. Quelqu'un qui changerait
// de version entre deux visites fausserait la mesure.
//
// Le cookie, plutôt que le stockage du navigateur, parce que le serveur le
// reçoit à chaque requête : il enregistre donc l'inscription avec la version
// réellement vue, sans que la page ait à la lui redire.
//
// La variante part aussi avec les évènements Meta (paramètre `ab_<test>`).

const PREFIXE = 'ab_'
const DUREE_JOURS = 180

function lireCookie(nom) {
  try {
    const trouve = document.cookie.split('; ').find(c => c.startsWith(nom + '='))
    return trouve ? decodeURIComponent(trouve.slice(nom.length + 1)) : null
  } catch {
    return null
  }
}

function ecrireCookie(nom, valeur) {
  try {
    const age = DUREE_JOURS * 24 * 60 * 60
    document.cookie = `${nom}=${encodeURIComponent(valeur)}; path=/; max-age=${age}; samesite=lax`
  } catch { /* cookies refusés : la personne verra un tirage par visite */ }
}

/**
 * @param {string} nom     Nom du test, par exemple 'prix'
 * @param {string[]} choix Versions possibles — la première est la référence
 * @returns {string} la version attribuée à ce visiteur
 */
export function variante(nom, choix = ['A', 'B']) {
  const cookie = PREFIXE + nom

  // ?ab_prix=sans sert à prévisualiser une version. Ce choix ne s'enregistre
  // pas : un lien de test ne doit pas enfermer qui le reçoit dans une version.
  try {
    const demandee = new URLSearchParams(window.location.search).get(cookie)
    if (choix.includes(demandee)) return demandee
  } catch { /* URL illisible : on passe au tirage normal */ }

  const deja = lireCookie(cookie)
  if (choix.includes(deja)) return deja

  const tiree = choix[Math.floor(Math.random() * choix.length)]
  ecrireCookie(cookie, tiree)
  return tiree
}
