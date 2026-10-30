import { Instagram, ArrowUpRight } from 'lucide-react'

// Les tournages que nous réalisons pour des clients, en bas de l'accueil.
// Comme le fil de l'académie : l'image est hébergée ici et l'appui ouvre la
// publication, Instagram n'autorisant pas la lecture dans un autre site.

export default function Productions({ productions }) {
  if (!productions?.enabled || !(productions.posts || []).length) return null

  return (
    <section className="py-8 lg:py-12 border-t border-academy-border">
      <div className="section-container">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">L'agence</p>
            <h2 className="mt-1 font-display font-black text-2xl sm:text-3xl tracking-tight text-academy-textMain">
              Nos productions audiovisuelles
            </h2>
            <p className="mt-1.5 text-[15px] text-academy-textMain/60 max-w-xl">
              Ce que nous tournons et montons pour nos clients. C'est ce métier que nous enseignons.
            </p>
          </div>
          <a href={`https://www.instagram.com/${productions.account}/`} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 text-sm font-bold text-academy-textMain border-b-2 border-academy-textMain hover:text-academy-primary hover:border-academy-primary transition-colors">
            <Instagram size={15} /> @{productions.account}
          </a>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-1">
          {productions.posts.map(p => (
            <a key={p.code} href={`https://www.instagram.com/reel/${p.code}/`} target="_blank" rel="noopener noreferrer"
               className="group snap-start shrink-0 w-[180px] sm:w-[220px]">
              <div className="relative rounded-xl overflow-hidden border border-academy-border bg-black aspect-[9/16]">
                <img src={`/productions/${p.code}.jpg`} alt={`Production de @${p.account}`}
                     loading="lazy" decoding="async"
                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 pt-10 bg-gradient-to-t from-black/85 to-transparent">
                  <p className="flex items-center gap-1 text-[12px] font-bold text-white">
                    <Instagram size={12} className="shrink-0" /> @{p.account}
                  </p>
                </div>
                <ArrowUpRight size={16} className="absolute top-2 right-2 text-white/70" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
