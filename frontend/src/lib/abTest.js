// ============================================================
// A/B TEST — une variante tirée au sort, puis gardée
// ============================================================
//
// Le visiteur tombe sur A ou B à sa première visite et revoit la même ensuite :
// une personne qui changerait de version entre deux visites fausserait la
// mesure. La variante part avec les évènements Meta (paramètre `ab_<test>`),
// c'est là qu'on compare les conversions.
//
// Ajouter un test : appeler variante('mon-test') et se servir du résultat.
// Les tirages déjà faits ne bougent pas, chaque test a sa propre clé.

const CLE = 'mylta-ab'

/**
 * @param {string} nom      Nom du test, par exemple 'prix'
 * @param {string[]} choix  Variantes possibles — la première est la référence
 * @returns {string} la variante attribuée à ce visiteur
 */
export function variante(nom, choix = ['A', 'B']) {
  try {
    const deja = JSON.parse(localStorage.getItem(CLE) || '{}')
    if (choix.includes(deja[nom])) return deja[nom]
    const tiree = choix[Math.floor(Math.random() * choix.length)]
    localStorage.setItem(CLE, JSON.stringify({ ...deja, [nom]: tiree }))
    return tiree
  } catch {
    // Stockage bloqué (navigation privée) : tout le monde voit la référence,
    // plutôt qu'une variante différente à chaque page.
    return choix[0]
  }
}
