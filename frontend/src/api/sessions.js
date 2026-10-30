import api from './axios'

// Les dates de la formation en présentiel sont réclamées par plusieurs blocs
// de la même page (l'annonce, le choix d'accueil, le pôle formations, la
// prochaine session…). Chacun appelait l'API de son côté : quatre requêtes
// identiques à chaque chargement, pour une donnée qui ne bouge pas pendant la
// visite. Ici, le premier appel est partagé par tous les suivants.

let enCours = null

/**
 * @param {boolean} rafraichir  Refaire l'appel (après une réservation, par
 *                              exemple, où le nombre de places a changé).
 * @returns {Promise<Array>} les sessions
 */
export function getSessions(rafraichir = false) {
  if (rafraichir) enCours = null

  enCours ??= api.get('/in-person/sessions')
    .then(({ data }) => data.sessions || [])
    .catch(err => {
      enCours = null // un échec ne doit pas être mémorisé : on pourra réessayer
      throw err
    })

  return enCours
}
