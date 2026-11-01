// Les trois jours racontés en quinze cases : on entre sans rien savoir, on
// ressort avec un métier. Les dessins sont vectoriels (environ 900 octets la
// case) : ils restent nets sur tous les écrans et ne coûtent aucun décodage.

const CASES = [
  { jour: 'Avant',  texte: 'Vous poussez la porte sans rien savoir faire. Tout le monde commence là.' },
  { jour: 'Avant',  texte: "Votre vidéo d'avant : sombre, floue, et qui tremble." },
  { jour: 'Jour 1', texte: 'Les réglages cachés : 60 images/seconde, mise au point et lumière verrouillées.' },
  { jour: 'Jour 1', texte: 'Une fenêtre, une lampe de salon : voilà votre éclairage de studio.' },
  { jour: 'Jour 1', texte: "Le son : l'erreur qui tue une vidéo, et comment l'éviter sans micro cher." },
  { jour: 'Jour 1', texte: "Le cadrage : règle des tiers, place du regard, et l'image respire." },
  { jour: 'Jour 1', texte: 'Marcher, tenir, faire glisser : filmer stable sans stabilisateur.' },
  { jour: 'Jour 1', texte: 'Atelier : votre première séquence, corrigée en direct devant le groupe.' },
  { jour: 'Jour 2', texte: 'CapCut : couper au rythme de la musique, seconde par seconde.' },
  { jour: 'Jour 2', texte: "Des sous-titres qui retiennent, et le look cinéma en trois réglages." },
  { jour: 'Jour 2', texte: "L'IA écrit le script, pose la voix off et crée vos miniatures." },
  { jour: 'Jour 2', texte: 'Atelier : la séquence du jour 1, montée du début à la fin.' },
  { jour: 'Jour 3', texte: 'Le hook : les 3 premières secondes qui décident de tout.' },
  { jour: 'Jour 3', texte: "Le contenu UGC : filmer un produit pour une marque, le format le plus demandé." },
  { jour: 'Jour 3', texte: 'Certificat en main, portfolio prêt, premier client à démarcher.' },
]

export default function BandeDessinee() {
  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory
                    overscroll-x-contain [-webkit-overflow-scrolling:touch] pb-1">
      {CASES.map((c, i) => (
        <figure key={i} className="shrink-0 w-[208px] snap-start">
          <div className="relative rounded-xl overflow-hidden border border-academy-border bg-academy-surface">
            <img src={`/bd/bd-${String(i + 1).padStart(2, '0')}.svg`} alt=""
                 width="400" height="300" loading="lazy" decoding="async"
                 className="w-full h-auto block" />
            <span className="absolute top-1.5 left-1.5 rounded-full bg-academy-textMain/85 text-white
                             px-2 py-0.5 text-[10px] font-black tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="absolute top-1.5 right-1.5 rounded-full bg-white/90 text-academy-primary
                             px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
              {c.jour}
            </span>
          </div>
          <figcaption className="mt-2 text-[13px] leading-snug text-academy-textMain/70">{c.texte}</figcaption>
        </figure>
      ))}
    </div>
  )
}
