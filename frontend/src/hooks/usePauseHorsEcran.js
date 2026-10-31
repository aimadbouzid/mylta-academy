import { useEffect } from 'react'

// Met une animation CSS en pause tant que son élément n'est pas à l'écran.
//
// Une animation `infinite` continue de tourner même quand le bloc est à mille
// pixels sous le pli : le navigateur recompose la couche à chaque image, pour
// personne. Sur un téléphone d'entrée de gamme, deux bandeaux défilants en
// permanence se sentent sur le défilement de toute la page et sur la batterie.
export function usePauseHorsEcran(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([e]) => { el.style.animationPlayState = e.isIntersecting ? '' : 'paused' },
      { rootMargin: '150px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}
