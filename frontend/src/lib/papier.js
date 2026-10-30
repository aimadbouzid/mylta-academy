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

// Les écritures de l'imprimé. Les titres étaient en Anton, une condensée
// d'affiche, et les mentions en chasse fixe : deux polices étrangères au reste
// du site, qui donnaient à ces blocs un air de vieille affiche de cinéma. On
// reprend les polices du site — Archivo pour les titres, Inter pour le texte —
// et il ne reste de l'imprimé que le papier, la trame et la bande rouge.
export const TITRE = { fontFamily: '"Archivo", "Inter", sans-serif', fontWeight: 900, letterSpacing: '-0.01em' }
export const SERIF = { fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }
export const MONO = { fontFamily: '"Inter", system-ui, sans-serif' }
