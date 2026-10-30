// Papier imprimé — l'aspect commun au billet de la formation et aux blocs
// qui reprennent son style. Rassemblé ici pour qu'une retouche de teinte ou
// de trame s'applique partout d'un coup, sans que les blocs divergent.
//
// Ces couleurs ne suivent pas le thème du site : un imprimé est un objet posé
// sur la page, comme une photo. Il reste donc en papier clair, y compris en
// thème sombre, où il ressort d'autant mieux.

export const PAPIER = '#efe8da'
export const ENCRE = '#17150f'
export const ROUGE = '#c0392f'

// Trame d'imprimerie : des points fins, comme l'impression d'un vrai ticket.
export const TRAME = `radial-gradient(${ENCRE}1f 0.7px, transparent 0.8px)`

/** Fond papier complet, à étaler sur un conteneur. */
export const fondPapier = {
  background: PAPIER,
  backgroundImage: TRAME,
  backgroundSize: '4px 4px',
  color: ENCRE,
}

// Les trois écritures de l'imprimé : titres condensés, accents en serif
// italique, mentions en chasse fixe (celle du système : rien à télécharger).
export const TITRE = { fontFamily: '"Anton", "Archivo", sans-serif', fontWeight: 400 }
export const SERIF = { fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }
export const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }
