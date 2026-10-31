import { useEffect, useRef, useState } from 'react'

// Affichage par lots d'une rangée qui défile horizontalement.
//
// `loading="lazy"` ne suffit pas ici : le navigateur considère qu'une rangée
// visible à l'écran est « en vue » et télécharge aussi les vignettes situées
// loin sur sa droite. Résultat, trois rangées suffisaient à réclamer près de
// quatre-vingt-dix images d'un coup à l'ouverture de l'accueil.
//
// La seule façon fiable de ne pas les charger est de ne pas les poser dans la
// page. On en met donc quelques-unes, puis le lot suivant quand le visiteur
// approche de la fin de la rangée.
//
// @param {number} total  Nombre d'éléments disponibles
// @param {number} lot    Combien en afficher d'emblée, puis à chaque fois
// @returns {[object, number]} la référence à poser sur la rangée, et la limite
export function useLotDefile(total, lot = 8) {
  const ref = useRef(null)
  const [limite, setLimite] = useState(lot)

  useEffect(() => {
    const el = ref.current
    if (!el || limite >= total) return

    const verifier = () => {
      if (el.scrollLeft > 0 && el.scrollLeft > el.scrollWidth - el.clientWidth - 700) {
        setLimite(l => (l >= total ? l : l + lot))
      }
    }

    el.addEventListener('scroll', verifier, { passive: true })
    return () => el.removeEventListener('scroll', verifier)
  }, [total, lot, limite])

  return [ref, limite]
}
